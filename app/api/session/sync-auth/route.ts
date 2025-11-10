import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'missing_or_invalid_authorization' }, { status: 400 });
  }

  const token = authHeader.replace(/^[Bb]earer\s+/, '').trim();
  if (!token) {
    return NextResponse.json({ error: 'empty_token' }, { status: 400 });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const cookieValue = `AuthProxyToken=${encodeURIComponent(token)}; Path=/api/stream; HttpOnly; SameSite=Lax; Max-Age=900;${isProd ? ' Secure;' : ''}`;

  const res = new NextResponse(null, { status: 204 });
  res.headers.set('Set-Cookie', cookieValue);
  return res;
}

export async function DELETE() {
  const isProd = process.env.NODE_ENV === 'production';
  const res = new NextResponse(null, { status: 204 });
  res.headers.set('Set-Cookie', `AuthProxyToken=; Path=/api/stream; HttpOnly; SameSite=Lax; Max-Age=0;${isProd ? ' Secure;' : ''}`);
  return res;
}