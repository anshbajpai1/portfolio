import { useEffect, useState } from 'react';
import { GithubIcon, LoaderCircle } from 'lucide-react';
import { getGitHubContributions, type ContributionDay } from '../data/githubContributions';

function label(date: string, count: number) { return `${count} public contribution${count === 1 ? '' : 's'} on ${new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric', timeZone:'UTC' })}`; }

export function ContributionHeatmap({ username }: { username: string }) {
  const [days, setDays] = useState<ContributionDay[] | null>(null); const [error, setError] = useState(false); const [hover, setHover] = useState('Hover a square to inspect public activity');
  useEffect(() => { if (!username) return; setError(false); getGitHubContributions(username).then(setDays).catch(() => setError(true)); }, [username]);
  // Render GitHub's calendar response as-is. GitHub includes partial weeks at
  // each edge, so rebuilding a browser-local 365-day range loses real cells.
  const cells = days || [];
  const total = cells.reduce((sum,c)=>sum+c.count,0);
  if (!username) return null;
  return <div className="heatmap-card"><div className="heatmap-head"><div><GithubIcon size={16}/><b>LIVE GITHUB CONTRIBUTIONS</b><span>GITHUB PROFILE / PUBLIC CALENDAR</span></div><strong>{days ? `${total} CONTRIBUTIONS` : 'SYNCING'}</strong></div>{error ? <div className="heatmap-empty">GitHub contributions could not load right now. <a href={`https://github.com/${username}`} target="_blank">Open profile ↗</a></div> : !days ? <div className="heatmap-empty"><LoaderCircle className="spin" size={18}/> Syncing GitHub contributions…</div> : <><div className="heatmap-grid" role="grid" aria-label="GitHub contribution heatmap">{cells.map(c => <button key={c.date} role="gridcell" className={`heat-cell l${Math.min(4,c.count)}`} aria-label={label(c.date,c.count)} onMouseEnter={()=>setHover(label(c.date,c.count))} onFocus={()=>setHover(label(c.date,c.count))}/>)}</div><div className="heatmap-foot"><span>{hover}</span><span className="legend">Less <i className="l0"/><i className="l1"/><i className="l2"/><i className="l3"/><i className="l4"/> More</span></div></>}</div>;
}
