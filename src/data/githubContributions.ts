export type ContributionDay = { date: string; count: number };
type ContributionResponse = { days?: ContributionDay[] };

const endpoint = import.meta.env.VITE_GITHUB_CONTRIBUTIONS_API_URL || '/api/github/contributions';

export async function getGitHubContributions(username: string): Promise<ContributionDay[]> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const response = await fetch(`${endpoint}${separator}username=${encodeURIComponent(username)}`, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error('GitHub contributions are unavailable');
  const payload = await response.json() as ContributionResponse;
  if (!Array.isArray(payload.days)) throw new Error('GitHub contributions returned an invalid response');
  return payload.days;
}
