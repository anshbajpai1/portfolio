/**
 * Public GitHub contribution-calendar proxy.
 * GitHub exposes this feed on profile pages, but browsers cannot reliably read
 * it cross-origin. The endpoint needs no token and keeps the portfolio source
 * free of credentials.
 */
import { parseContributionDays } from '../../shared/github-calendar.mjs';

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const username = url.searchParams.get('username')?.trim();

  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) return json({ error: 'A valid GitHub username is required' }, 400);

  try {
    const response = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
      headers: { accept: 'text/html', 'user-agent': 'portfolio-contribution-dashboard/1.0' },
    });
    if (!response.ok) return json({ error: 'GitHub contribution data is unavailable' }, response.status);

    const days = parseContributionDays(await response.text());
    return json({ days, updatedAt: new Date().toISOString() });
  } catch {
    return json({ error: 'GitHub contribution data is temporarily unavailable' }, 502);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200 ? 'public, max-age=0, s-maxage=60, must-revalidate' : 'no-store',
    },
  });
}
