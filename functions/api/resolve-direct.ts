// Cloudflare Pages Function for resolving direct stream
export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const videoId = url.searchParams.get('videoId');
  const format = url.searchParams.get('format') || '720';
  const title = url.searchParams.get('title') || 'video';
  const ext = url.searchParams.get('ext') || 'mp4';

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'معرف الفيديو مطلوب' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Prefer the original CDN URL returned by the working AI Studio backend.
  // Sending the browser to that URL avoids buffering the whole file through
  // a Cloudflare Function, which can make small downloads unnecessarily slow.
  try {
    const upstreamUrl = new URL('https://sahr-altahmeel.ai.studio/api/resolve-direct');
    upstreamUrl.search = url.search;
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(90000),
    });
    if (upstream.ok) {
      const data: any = await upstream.json();
      if (data?.rawUrl && typeof data.rawUrl === 'string' && data.rawUrl.startsWith('http')) {
        return new Response(JSON.stringify({
          ...data,
          directUrl: data.rawUrl,
          rawUrl: data.rawUrl,
        }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }
  } catch {}

  const downloadUrl = `/api/download-direct?videoId=${encodeURIComponent(videoId)}&format=${encodeURIComponent(format)}&title=${encodeURIComponent(title)}&ext=${encodeURIComponent(ext)}`;

  return new Response(JSON.stringify({
    success: true,
    directUrl: downloadUrl,
    downloadUrl: downloadUrl
  }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
}
