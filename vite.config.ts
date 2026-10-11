import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function parseContributionDays(markup: string) {
  const countsByCell = new Map<string, number>();
  for (const match of markup.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)) {
    const count = /(\d[\d,]*)\s+contributions?\b/i.exec(match[2].replace(/<[^>]+>/g, ' '))?.[1];
    countsByCell.set(match[1], count ? Number(count.replace(/,/g, '')) : 0);
  }
  return (markup.match(/<td\b[^>]*>/g) || []).flatMap(tag => { const date = /data-date="([^"]+)"/.exec(tag)?.[1]; const id = /\bid="([^"]+)"/.exec(tag)?.[1]; return date && id ? [{ date, count: countsByCell.get(id) || 0 }] : []; });
}

const githubContributions = {
  name: 'github-contributions-proxy',
  configureServer(server: { middlewares: { use: (path: string, handler: (request: { url?: string; method?: string }, response: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }) => Promise<void>) => void } }) {
    server.middlewares.use('/api/github/contributions', async (request, response) => {
      const username = new URL(request.url || '', 'http://localhost').searchParams.get('username') || '';
      if (request.method !== 'GET' || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) { response.statusCode = 400; response.end(JSON.stringify({ error: 'A valid GitHub username is required' })); return; }
      try {
        const upstream = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, { headers: { accept: 'text/html', 'user-agent': 'portfolio-contribution-dashboard/1.0' } });
        const markup = await upstream.text();
        const days = parseContributionDays(markup);
        response.statusCode = upstream.ok ? 200 : upstream.status;
        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(upstream.ok ? { days, updatedAt: new Date().toISOString() } : { error: 'GitHub contribution data is unavailable' }));
      } catch { response.statusCode = 502; response.end(JSON.stringify({ error: 'GitHub contribution data is temporarily unavailable' })); }
    });
  },
};

export default defineConfig({ plugins: [react(), githubContributions], server: { proxy: { '/api/leetcode': { target: 'https://leetcode.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/leetcode/, '') } } } });
