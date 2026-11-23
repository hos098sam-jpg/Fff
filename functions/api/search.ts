type AnyRecord = Record<string, any>;

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function extractVideoId(value: string) {
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  const match = value.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match?.[1] || null;
}

function text(runs: any[] | undefined, fallback = '') {
  return Array.isArray(runs) ? runs.map((run) => run?.text || '').join('') : fallback;
}

function mapVideo(video: AnyRecord) {
  const id = video.videoId;
  const title = text(video.title?.runs, video.title?.simpleText || 'فيديو يوتيوب');
  const author = text(video.ownerText?.runs, text(video.longBylineText?.runs, 'قناة يوتيوب'));
  const thumbnails = video.thumbnail?.thumbnails || [];
  const thumbnail = thumbnails.at(-1)?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return {
    id,
    title,
    description: text(video.detailedMetadataSnippets?.[0]?.snippetText?.runs),
    author: { name: author, channelUrl: '', avatar: '' },
    duration: video.lengthText?.simpleText || '',
    views: video.viewCountText?.simpleText || video.shortViewCountText?.simpleText || '',
    publishedTime: video.publishedTimeText?.simpleText || '',
    thumbnail,
    videoUrl: `https://www.youtube.com/watch?v=${id}`,
    isShort: false,
  };
}

async function directYouTubeSearch(query: string) {
  try {
    const target = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=ar&gl=EG`;
    const res = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123 Safari/537.36',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});<\/script>/s)
      || html.match(/window\["ytInitialData"\]\s*=\s*(\{.+?\});<\/script>/s);
    if (!match) return [];
    const data = JSON.parse(match[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const results: AnyRecord[] = [];
    for (const section of sections) {
      for (const item of section?.itemSectionRenderer?.contents || []) {
        const video = item?.videoRenderer;
        if (video?.videoId) results.push(mapVideo(video));
      }
    }
    return results.slice(0, 20);
  } catch {
    return [];
  }
}

async function fallbackSearch(query: string) {
  const instances = [
    'https://invidious.f5.si',
    'https://inv.tux.pizza',
    'https://vid.puffyan.us',
    'https://api.piped.private.coffee',
    'https://pipedapi.kavin.rocks',
  ];
  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const list = await res.json();
      if (!Array.isArray(list) || !list.length) continue;
      return list.filter((item) => item?.videoId).slice(0, 20).map((item) => ({
        id: item.videoId,
        title: item.title || 'فيديو يوتيوب',
        description: item.description || '',
        author: { name: item.author || 'قناة يوتيوب', channelUrl: '', avatar: '' },
        duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, '0')}` : '',
        views: item.viewCount ? String(item.viewCount) : '',
        publishedTime: item.publishedText || '',
        thumbnail: item.videoThumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
        isShort: false,
      }));
    } catch {}
  }
  return [];
}

export async function onRequest(context: { request: Request }) {
  const query = new URL(context.request.url).searchParams.get('q')?.trim();
  if (!query) return response({ error: 'الرجاء إدخال كلمة بحث' }, 400);
  const videoId = extractVideoId(query);
  if (videoId) return response({ isDirectUrl: true, videoId, results: [] });

  let results = await directYouTubeSearch(query);
  if (!results.length) results = await fallbackSearch(query);
  return response({ query, total: results.length, results });
}
