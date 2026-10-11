export default async (request) => {
  const username = new URL(request.url).searchParams.get('username')?.trim();
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) return json({ error: 'A valid GitHub username is required' }, 400);
  try {
    const response = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, { headers: { accept: 'text/html', 'user-agent': 'portfolio-contribution-dashboard/1.0' } });
    if (!response.ok) return json({ error: 'GitHub contribution data is unavailable' }, response.status);
    const markup = await response.text();
    const countsByCell = new Map();
    for (const match of markup.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)) {
      const text = match[2].replace(/<[^>]+>/g, ' ');
      const count = /(\d[\d,]*)\s+contributions?\b/i.exec(text)?.[1];
      countsByCell.set(match[1], count ? Number(count.replace(/,/g, '')) : 0);
    }
    const days = (markup.match(/<td\b[^>]*>/g) || []).flatMap(tag => { const date = /data-date="([^"]+)"/.exec(tag)?.[1]; const id = /\bid="([^"]+)"/.exec(tag)?.[1]; return date && id ? [{ date, count: countsByCell.get(id) || 0 }] : []; });
    return json({ days, updatedAt: new Date().toISOString() });
  } catch { return json({ error: 'GitHub contribution data is temporarily unavailable' }, 502); }
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } });
