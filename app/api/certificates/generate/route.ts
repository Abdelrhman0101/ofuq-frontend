import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
// @ts-ignore
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface CertificateUser {
  id: number;
  name: string;
  email?: string;
}

interface CertificateCourseOrCategory {
  id: number;
  title?: string;
}

interface CertificatePayload {
  id: number;
  verification_token: string;
  verification_url: string;
  issued_at?: string;
  completion_date?: string;
  file_path?: string | null;
  user?: CertificateUser;
  course?: CertificateCourseOrCategory;
  category?: CertificateCourseOrCategory;
  data?: {
    user_name?: string;
    user_email?: string;
    course_title?: string;
    completion_date?: string;
    enrollment_date?: string;
    progress_percentage?: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type: 'course' | 'diploma' = body?.type;
    const certificate: CertificatePayload = body?.certificate;

    if (!type || !certificate || !certificate.id || !certificate.verification_url) {
      return NextResponse.json({ message: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    // Ensure output directory exists
    const publicDir = path.join(process.cwd(), 'public', 'certificates');
    await fs.promises.mkdir(publicDir, { recursive: true });

    // Load cover image from assets (fallbacks allowed)
    const pdfDoc = await PDFDocument.create();
    let coverImage: any = null;
    let pageWidth = 595; // A4 portrait width
    let pageHeight = 842; // A4 portrait height

    // Try primary cover, then fallback to banner, else use blank background
    try {
      const coverPath = path.join(process.cwd(), 'assets', 'certifecate_cover.jpg');
      const coverBytes = await fs.promises.readFile(coverPath);
      coverImage = await pdfDoc.embedJpg(coverBytes);
      pageWidth = coverImage.width;
      pageHeight = coverImage.height;
    } catch (_) {
      try {
        const fallbackPath = path.join(process.cwd(), 'assets', 'banner.jpg');
        const fbBytes = await fs.promises.readFile(fallbackPath);
        coverImage = await pdfDoc.embedJpg(fbBytes);
        pageWidth = coverImage.width;
        pageHeight = coverImage.height;
      } catch (__) {
        // No cover available; proceed with blank page
        coverImage = null;
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    if (coverImage) {
      page.drawImage(coverImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    } else {
      // Draw a subtle background when no cover image exists
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Resolve display strings
    const title =
      type === 'diploma'
        ? (certificate?.category?.title || certificate?.data?.course_title || 'الدبلومة')
        : (certificate?.course?.title || certificate?.data?.course_title || 'المقرر');
    const userName = certificate?.user?.name || certificate?.data?.user_name || '';
    const completionDateStr = certificate?.completion_date || certificate?.data?.completion_date || '';
    const issuedAtStr = certificate?.issued_at || '';

    // Draw a semi-transparent white box in center for text readability
    const boxWidth = pageWidth * 0.7;
    const boxHeight = 160;
    const centerX = pageWidth / 2 - boxWidth / 2;
    const centerY = pageHeight / 2 - boxHeight / 2;
    page.drawRectangle({
      x: centerX,
      y: centerY,
      width: boxWidth,
      height: boxHeight,
      color: rgb(1, 1, 1),
      opacity: 0.8,
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1,
    });

    // Centered text helper
    const drawCentered = (text: string, y: number, fontRef: any, size: number) => {
      if (!text) return;
      const textWidth = fontRef.widthOfTextAtSize(text, size);
      const x = pageWidth / 2 - textWidth / 2;
      page.drawText(text, { x, y, size, font: fontRef, color: rgb(0, 0, 0) });
    };

    // Compose lines
    drawCentered('شهادة إتمام', centerY + 100, font, 18);
    drawCentered(title, centerY + 72, fontBold, 22);
    drawCentered(userName ? `المستلم: ${userName}` : '', centerY + 42, font, 16);
    if (completionDateStr) {
      const dateLabel = `تاريخ الإكمال: ${new Date(completionDateStr).toLocaleDateString('ar-EG')}`;
      drawCentered(dateLabel, centerY + 18, font, 16);
    }

    // QR code linking to verification_url (backend will redirect/file-show accordingly)
    const verificationUrl = certificate.verification_url;
    if (verificationUrl) {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 256, margin: 1 });
      const qrBase64 = qrDataUrl.split(',')[1];
      const qrBytes = Buffer.from(qrBase64, 'base64');
      const qrImage = await pdfDoc.embedPng(qrBytes);
      const qrSize = 160;
      const margin = 30;
      page.drawImage(qrImage, {
        x: pageWidth - qrSize - margin,
        y: margin,
        width: qrSize,
        height: qrSize,
      });
    }

    // Bottom token text for additional verification
    const token = certificate.verification_token || '';
    if (token) {
      const verifyText = `رمز التحقق: ${token}`;
      const w = font.widthOfTextAtSize(verifyText, 12);
      const x = pageWidth / 2 - w / 2;
      page.drawText(verifyText, { x, y: 20, size: 12, font, color: rgb(0.2, 0.2, 0.2) });
    }

    // File name hashing
    const salt = crypto.randomBytes(6).toString('hex');
    const baseId = `${certificate.id}-${certificate?.user?.id || ''}-${certificate?.course?.id || certificate?.category?.id || ''}`;
    const hash = crypto
      .createHash('sha256')
      .update(`${baseId}-${token}-${issuedAtStr}-${salt}`)
      .digest('hex')
      .slice(0, 16);
    const filename = `${type}-${hash}.pdf`;
    const outPath = path.join(publicDir, filename);

    const pdfBytes = await pdfDoc.save();
    await fs.promises.writeFile(outPath, pdfBytes);

    const fileUrl = `${origin}/certificates/${filename}`;
    return NextResponse.json({ file_path: fileUrl, filename }, { status: 201 });
  } catch (err) {
    console.error('Generate certificate PDF error:', err);
    return NextResponse.json({ message: 'فشل في توليد ملف الشهادة' }, { status: 500 });
  }
}