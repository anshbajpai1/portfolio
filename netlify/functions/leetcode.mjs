export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'portfolio-leetcode-dashboard/1.0' },
      body: await request.text(),
    });
    return new Response(await response.text(), { status: response.status, headers: headers() });
  } catch { return json({ error: 'LeetCode is temporarily unavailable' }, 502); }
};

const headers = () => ({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: headers() });
