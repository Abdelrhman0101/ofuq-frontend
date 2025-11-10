import { NextResponse } from 'next/server';
import { getBackendAssetUrl } from '@/utils/url';

function parseCookie(cookie: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookie) return out;
  cookie.split(';').forEach(part => {
    const [k, v] = part.split('=');
    if (!k) return;
    out[k.trim()] = decodeURIComponent((v || '').trim());
  });
  return out;
}

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  const cookies = parseCookie(req.headers.get('cookie'));
  const token = cookies['AuthProxyToken'];
  if (!token) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return NextResponse.json({ error: 'backend_unconfigured' }, { status: 500 });
  }

  // Fetch lesson to get the original video URL (requires auth)
  let originalUrl = '';
  try {
    const lessonResp = await fetch(`${apiBase.replace(/\/$/, '')}/lessons/${params.lessonId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });
    if (!lessonResp.ok) {
      return NextResponse.json({ error: 'lesson_fetch_failed', status: lessonResp.status }, { status: 403 });
    }
    const payload = await lessonResp.json();
    const lesson = (payload?.lesson ?? payload?.data?.lesson ?? payload?.data) || {};
    originalUrl = String(lesson.video_url || '');
    if (!originalUrl) {
      return NextResponse.json({ error: 'missing_video_url' }, { status: 404 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'lesson_fetch_error' }, { status: 500 });
  }

  const sourceUrl = getBackendAssetUrl(originalUrl);
  const range = req.headers.get('range') || req.headers.get('Range') || undefined;

  // Proxy stream with Range support
  try {
    const upstream = await fetch(sourceUrl, {
      headers: {
        ...(range ? { 'Range': range } : {}),
        'Accept': 'video/*;q=0.9,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    const headers = new Headers();
    const ct = upstream.headers.get('content-type') || upstream.headers.get('Content-Type') || 'video/mp4';
    const cl = upstream.headers.get('content-length') || upstream.headers.get('Content-Length');
    const cr = upstream.headers.get('content-range') || upstream.headers.get('Content-Range');
    const ar = upstream.headers.get('accept-ranges') || upstream.headers.get('Accept-Ranges');

    headers.set('Content-Type', ct);
    if (cl) headers.set('Content-Length', cl);
    if (cr) headers.set('Content-Range', cr);
    if (ar) headers.set('Accept-Ranges', ar);
    headers.set('Cache-Control', 'no-store');
    headers.set('Content-Disposition', 'inline');
    headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('X-Content-Type-Options', 'nosniff');
    // Hide origin details
    headers.delete('Access-Control-Allow-Origin');

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    return NextResponse.json({ error: 'upstream_fetch_error' }, { status: 502 });
  }
}