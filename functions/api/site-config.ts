export async function onRequest() {
  try {
    const response = await fetch('https://sahr-altahmeel.ai.studio/api/site-config', {
      headers: { Accept: 'application/json' },
    });
    const body = await response.text();
    return new Response(body, {
      status: response.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response(JSON.stringify({}), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}
