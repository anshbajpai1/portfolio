export type ContributionDay = { date: string; count: number; level?: number };
type ContributionResponse = { days?: ContributionDay[] };

const endpoint = import.meta.env.VITE_GITHUB_CONTRIBUTIONS_API_URL || '/api/github/contributions';

export async function getGitHubContributions(username: string): Promise<ContributionDay[]> {
  const separator = endpoint.includes('?') ? '&' : '?';
  // Netlify's edge can retain the same API URL briefly even with no-cache. A
  // request nonce makes every refresh use a fresh edge key and re-read GitHub.
  const nonce = Date.now().toString(36);
  const response = await fetch(`${endpoint}${separator}username=${encodeURIComponent(username)}&_=${nonce}`, { cache: 'no-store', headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error('GitHub contributions are unavailable');
  const payload = await response.json() as ContributionResponse;
  if (!Array.isArray(payload.days)) throw new Error('GitHub contributions returned an invalid response');
  if (!payload.days.length || payload.days.some(day => !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isInteger(day.count) || day.count < 0)) throw new Error('Invalid GitHub calendar');
  return [...payload.days].sort((a, b) => a.date.localeCompare(b.date));
}
