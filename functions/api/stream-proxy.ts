// Cloudflare Pages Function for Stream Proxy
export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('رابط الوسائط غير موجود', { status: 400 });
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const newHeaders = new Headers(upstreamRes.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: newHeaders
    });
  } catch (err: any) {
    return new Response(`فشل تدفق الوسائط: ${err?.message || 'خطأ'}`, { status: 500 });
  }
}
