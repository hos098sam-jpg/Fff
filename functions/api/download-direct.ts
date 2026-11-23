// Cloudflare Pages Function for Direct Download
export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const videoId = url.searchParams.get('videoId');
  const format = url.searchParams.get('format') || '720';
  const title = url.searchParams.get('title') || 'video';
  const ext = url.searchParams.get('ext') || 'mp4';

  if (!videoId) {
    return new Response('معرف الفيديو مطلوب', { status: 400 });
  }

  // Redirect or proxy via Invidious/Piped stream
  try {
    const pipedInstances = ['https://api.piped.private.coffee', 'https://pipedapi.kavin.rocks'];
    for (const instance of pipedInstances) {
      try {
        const res = await fetch(`${instance}/streams/${videoId}`, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const data = await res.json();
          const streams = data?.videoStreams || [];
          const candidate = streams.find((s: any) => !s.videoOnly && s.url) || streams[0];
          if (candidate && candidate.url) {
            const mediaRes = await fetch(candidate.url, {
              headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const headers = new Headers(mediaRes.headers);
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Content-Disposition', `attachment; filename="${title}.${ext}"`);
            return new Response(mediaRes.body, {
              status: mediaRes.status,
              headers
            });
          }
        }
      } catch {}
    }

    return new Response('تعذر تجهيز الملف للتحميل', { status: 500 });
  } catch (err: any) {
    return new Response(`خطأ أثناء التحميل: ${err?.message || 'خطأ'}`, { status: 500 });
  }
}
