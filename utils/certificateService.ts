'use client';

import apiClient from './apiClient';

export interface CertificateItem {
  id: number;
  course_title: string;
  issued_at: string;
  completion_date?: string | null;
  verification_token: string;
  verification_url: string;
  download_url: string;
}

export async function getMyCertificates(): Promise<CertificateItem[]> {
  const res = await apiClient.get('/my-certificates');
  const data = res.data;
  const list = Array.isArray(data?.certificates)
    ? data.certificates
    : Array.isArray(data?.data?.certificates)
      ? data.data.certificates
      : [];
  return list as CertificateItem[];
}

export function getVerificationUrl(tokenOrUrl: string): string {
  // Backend returns full verification_url; if token provided, construct a path
  if (!tokenOrUrl) return '';
  if (tokenOrUrl.startsWith('http')) return tokenOrUrl;
  return `/certificate/verify/${tokenOrUrl}`;
}

export function getDownloadUrl(url: string): string {
  return url || '';
}