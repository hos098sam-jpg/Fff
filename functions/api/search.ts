// Cloudflare Pages Function for Search
export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const q = url.searchParams.get('q');

  if (!q || !q.trim()) {
    return new Response(JSON.stringify({ error: 'الرجاء إدخال كلمة بحث' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const query = q.trim();

  // Helper to extract video ID
  const extractId = (str: string) => {
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
    const match = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : null;
  };

  const videoId = extractId(query);
  if (videoId) {
    return new Response(JSON.stringify({ isDirectUrl: true, videoId, results: [] }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Try Invidious / Piped instances
  const instances = [
    'https://invidious.f5.si',
    'https://inv.tux.pizza',
    'https://vid.puffyan.us',
    'https://api.piped.private.coffee',
    'https://pipedapi.kavin.rocks'
  ];

  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const results = list.map((item: any) => ({
            id: item.videoId,
            title: item.title,
            description: item.description || '',
            author: {
              name: item.author || 'قناة',
              channelUrl: item.authorUrl ? `${instance}${item.authorUrl}` : '',
              avatar: item.authorThumbnails?.[0]?.url || '',
            },
            duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, '0')}` : '03:00',
            views: item.viewCount ? `${(item.viewCount / 1000).toFixed(1)}K` : 'موافق',
            publishedTime: item.publishedText || '',
            thumbnail: item.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            videoUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
            isShort: item.lengthSeconds <= 60,
          }));
          return new Response(JSON.stringify({ query, total: results.length, results }), {
            headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }
    } catch {}
  }

  return new Response(JSON.stringify({ query, total: 0, results: [] }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });
}
