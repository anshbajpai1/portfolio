import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const githubContributions = {
  name: 'github-contributions-proxy',
  configureServer(server: { middlewares: { use: (path: string, handler: (request: { url?: string; method?: string }, response: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }) => Promise<void>) => void } }) {
    server.middlewares.use('/api/github/contributions', async (request, response) => {
      const username = new URL(request.url || '', 'http://localhost').searchParams.get('username') || '';
      if (request.method !== 'GET' || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) { response.statusCode = 400; response.end(JSON.stringify({ error: 'A valid GitHub username is required' })); return; }
      try {
        const upstream = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, { headers: { accept: 'text/html', 'user-agent': 'portfolio-contribution-dashboard/1.0' } });
        const markup = await upstream.text();
        const days = (markup.match(/<td\b[^>]*>/g) || []).flatMap(tag => { const date = /data-date="([^"]+)"/.exec(tag)?.[1]; const level = /data-level="(\d+)"/.exec(tag)?.[1]; return date && level ? [{ date, count: Number(level) }] : []; });
        response.statusCode = upstream.ok ? 200 : upstream.status;
        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(upstream.ok ? { days, updatedAt: new Date().toISOString() } : { error: 'GitHub contribution data is unavailable' }));
      } catch { response.statusCode = 502; response.end(JSON.stringify({ error: 'GitHub contribution data is temporarily unavailable' })); }
    });
  },
};

export default defineConfig({ plugins: [react(), githubContributions], server: { proxy: { '/api/leetcode': { target: 'https://leetcode.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/leetcode/, '') } } } });
