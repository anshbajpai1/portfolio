/**
 * Production API endpoint for the portfolio's LeetCode charts.
 *
 * Keeping the filename aligned with the browser URL avoids a rewrite that can
 * be skipped by static deployments or incorrectly ordered by a host.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: responseHeaders() });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: responseHeaders(),
    });
  }

  try {
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': 'portfolio-leetcode-dashboard/1.0',
      },
      body: await request.text(),
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: responseHeaders(),
    });
  } catch {
    return new Response(JSON.stringify({ error: 'LeetCode is temporarily unavailable' }), {
      status: 502,
      headers: responseHeaders(),
    });
  }
}

function responseHeaders(): HeadersInit {
  return {
    'content-type': 'application/json; charset=utf-8',
    // Cache briefly so several charts on the same portfolio page do not each
    // create a separate request to LeetCode.
    'cache-control': 'public, s-maxage=300, stale-while-revalidate=600',
  };
}
