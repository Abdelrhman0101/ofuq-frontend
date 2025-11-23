export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Proxy endpoint to stream PDF inline for preview.
 * Forces inline display to avoid automatic download.
 */
export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const target = urlObj.searchParams.get('url');
    if (!target) {
      return new Response('Missing url parameter', { status: 400 });
    }
    // Build full URL for relative storage/certificates paths, or accept http(s) URLs
    const isHttp = /^https?:\/\//i.test(target);
    const isAbsolutePath = target.startsWith('/');

    // Derive assets base (strip trailing /api if present)
    const assetsBase = (process.env.NEXT_PUBLIC_ASSETS_BASE_URL
      || process.env.NEXT_PUBLIC_API_BASE_URL
      || process.env.NEXT_PUBLIC_API_URL
      || '').replace(/\/api\/?$/, '');

    let normalizedTarget = target.trim();

    if (!isHttp) {
      if (!isAbsolutePath) {
        // Treat as storage-relative
        normalizedTarget = `/storage/${normalizedTarget.replace(/^storage\//i, '')}`;
      }
      // Prepend assets base for same-origin proxying
      if (assetsBase) {
        normalizedTarget = `${assetsBase}${normalizedTarget}`;
      } else {
        // Fallback: reject if we can't resolve to a full URL
        return new Response('Cannot resolve asset base for relative URL', { status: 400 });
      }
    }

    // Normalize localhost to IPv4 loopback to avoid IPv6 resolution issues on some systems
    normalizedTarget = normalizedTarget.replace('http://localhost:', 'http://127.0.0.1:');

    const backendRes = await fetch(normalizedTarget, {
      cache: 'no-store',
      headers: {
        Accept: 'application/pdf',
      },
    });
    if (!backendRes.ok || !backendRes.body) {
      const text = await backendRes.text().catch(() => '');
      return new Response(`Failed to fetch file (${backendRes.status}) ${text}`, {
        status: backendRes.status || 502,
      });
    }

    // Stream body to client and force inline display
    const headers = new Headers(backendRes.headers);
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'inline');
    headers.set('Cache-Control', 'no-store, must-revalidate');
    headers.delete('Content-Length'); // length may change when proxied
    headers.delete('X-Frame-Options'); // ensure embedding is allowed in preview

    return new Response(backendRes.body, {
      status: 200,
      headers,
    });
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : 'Error proxying file';
    return new Response(msg, { status: 500 });
  }
}