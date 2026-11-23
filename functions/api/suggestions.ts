export async function onRequest(context: { request: Request }) {
  const incoming = new URL(context.request.url);
  const target = new URL('https://sahr-altahmeel.ai.studio/api/suggestions');
  target.search = incoming.search;
  try {
    const response = await fetch(target, { headers: { Accept: 'application/json' } });
    const body = await response.text();
    return new Response(body, {
      status: response.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response('[]', {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}
