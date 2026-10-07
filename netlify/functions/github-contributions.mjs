export default async (request) => {
  const username = new URL(request.url).searchParams.get('username')?.trim();
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) return json({ error: 'A valid GitHub username is required' }, 400);
  try {
    const response = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, { headers: { accept: 'text/html', 'user-agent': 'portfolio-contribution-dashboard/1.0' } });
    if (!response.ok) return json({ error: 'GitHub contribution data is unavailable' }, response.status);
    const days = (await response.text()).match(/<td\b[^>]*>/g)?.flatMap(tag => { const date = /data-date="([^"]+)"/.exec(tag)?.[1]; const level = /data-level="(\d+)"/.exec(tag)?.[1]; return date && level ? [{ date, count: Number(level) }] : []; }) || [];
    return json({ days, updatedAt: new Date().toISOString() });
  } catch { return json({ error: 'GitHub contribution data is temporarily unavailable' }, 502); }
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } });
