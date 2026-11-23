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

  const downloadUrl = `/api/download-direct?videoId=${encodeURIComponent(videoId)}&format=${encodeURIComponent(format)}&title=${encodeURIComponent(title)}&ext=${encodeURIComponent(ext)}`;

  return new Response(JSON.stringify({
    success: true,
    directUrl: downloadUrl,
    downloadUrl: downloadUrl
  }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
}
