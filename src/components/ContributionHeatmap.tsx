import { useEffect, useMemo, useState } from 'react';
import { GithubIcon, LoaderCircle } from 'lucide-react';
import { getGitHubContributions, type ContributionDay } from '../data/githubContributions';

type Cell = { date: string; count: number };
function dateKey(date: Date) { return date.toISOString().slice(0, 10); }
function label(date: string, count: number) { return `${count} public contribution${count === 1 ? '' : 's'} on ${new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' })}`; }

export function ContributionHeatmap({ username }: { username: string }) {
  const [days, setDays] = useState<ContributionDay[] | null>(null); const [error, setError] = useState(false); const [hover, setHover] = useState('Hover a square to inspect public activity');
  useEffect(() => { if (!username) return; setError(false); getGitHubContributions(username).then(setDays).catch(() => setError(true)); }, [username]);
  const cells = useMemo<Cell[]>(() => { const tally = new Map((days || []).map(day => [day.date, day.count])); const end=new Date(); const start=new Date(end); start.setDate(end.getDate()-364); return Array.from({length:365},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const date=dateKey(d);return {date,count:tally.get(date)||0};}); },[days]);
  const total = cells.reduce((sum,c)=>sum+c.count,0);
  if (!username) return null;
  return <div className="heatmap-card"><div className="heatmap-head"><div><GithubIcon size={16}/><b>LIVE GITHUB CONTRIBUTIONS</b><span>GITHUB PROFILE / LAST 365 DAYS</span></div><strong>{days ? `${total} ACTIVITY` : 'SYNCING'}</strong></div>{error ? <div className="heatmap-empty">GitHub contributions could not load right now. <a href={`https://github.com/${username}`} target="_blank">Open profile ↗</a></div> : !days ? <div className="heatmap-empty"><LoaderCircle className="spin" size={18}/> Syncing GitHub contributions…</div> : <><div className="heatmap-grid" role="grid" aria-label="GitHub contribution heatmap">{cells.map(c => <button key={c.date} role="gridcell" className={`heat-cell l${Math.min(4,c.count)}`} aria-label={label(c.date,c.count)} onMouseEnter={()=>setHover(label(c.date,c.count))} onFocus={()=>setHover(label(c.date,c.count))}/>)}</div><div className="heatmap-foot"><span>{hover}</span><span className="legend">Less <i className="l0"/><i className="l1"/><i className="l2"/><i className="l3"/><i className="l4"/> More</span></div></>}</div>;
}
