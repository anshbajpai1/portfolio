import { useEffect, useState } from 'react';
import { GithubIcon, LoaderCircle, RefreshCw } from 'lucide-react';
import { getGitHubContributions, type ContributionDay } from '../data/githubContributions';

const DAY = 86400000;
const stamp = (date: string) => Date.parse(date + 'T00:00:00Z');
function label(day: ContributionDay) {
  return `${day.count} contribution${day.count === 1 ? '' : 's'} on ${new Date(stamp(day.date)).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
}

export function ContributionHeatmap({ username }: { username: string }) {
  const [days, setDays] = useState<ContributionDay[] | null>(null);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [syncing, setSyncing] = useState(true);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const [hover, setHover] = useState('Hover or tap a square to see daily contributions');
  useEffect(() => {
    let disposed = false;
    let pending = false;
    setDays(null); setSyncedAt(null);
    const sync = async () => {
      if (!username || pending) return;
      pending = true; setSyncing(true);
      try {
        const next = await getGitHubContributions(username);
        if (!disposed) { setDays(next); setError(false); setSyncedAt(new Date()); }
      } catch { if (!disposed) setError(true); }
      finally { pending = false; if (!disposed) setSyncing(false); }
    };
    void sync();
    const onFocus = () => { if (document.visibilityState === 'visible') void sync(); };
    const timer = window.setInterval(onFocus, 60000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onFocus); };
  }, [username, refresh]);
  if (!username) return null;
  const cells = days || [];
  const first = cells.length ? stamp(cells[0].date) : 0;
  const start = first - new Date(first).getUTCDay() * DAY;
  const column = (date: string) => Math.floor((stamp(date) - start) / DAY / 7) + 1;
  const weeks = cells.length ? column(cells[cells.length - 1].date) : 53;
  const months: { label: string; column: number }[] = [];
  for (let week = 0; week < weeks; week++) {
    const date = new Date(start + week * 7 * DAY);
    const month = date.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' });
    if (month !== months[months.length - 1]?.label) months.push({ label: month, column: week + 1 });
  }
  const total = cells.reduce((sum, day) => sum + day.count, 0);
  return <div className="heatmap-card github-calendar-card">
    <div className="heatmap-head">
      <div><GithubIcon size={16}/><b>GITHUB CONTRIBUTIONS</b></div>
      <strong>{days ? `${total} CONTRIBUTIONS` : error ? 'UNAVAILABLE' : 'SYNCING'}</strong>
      <button className="github-refresh" onClick={() => setRefresh(value => value + 1)} disabled={syncing} aria-label="Refresh GitHub contributions"><RefreshCw size={14} className={syncing ? 'spin' : ''}/></button>
    </div>
    {!days ? <div className="heatmap-empty">{error ? 'GitHub could not be reached. Please retry.' : <><LoaderCircle className="spin" size={18}/> Syncing GitHub contributions…</>}</div> : <>
      <div className="heatmap-scroll">
        <div className="heatmap-calendar">
          <div className="heatmap-months" style={{ gridTemplateColumns: `repeat(${weeks}, var(--gh-cell))` }}>{months.map(month => <span key={month.column} style={{ gridColumn: month.column, gridRow: 1 }}>{month.label}</span>)}</div>
          <div className="heatmap-weekdays"><span>Mon</span><span>Wed</span><span>Fri</span></div>
          <div className="heatmap-grid" role="group" aria-label="GitHub contribution calendar, Sunday to Saturday">
            {cells.map(day => <button key={day.date} className={`heat-cell l${day.level ?? Math.min(4, day.count)}`}
              style={{ gridColumn: column(day.date), gridRow: new Date(stamp(day.date)).getUTCDay() + 1 }}
              aria-label={label(day)} title={label(day)}
              onMouseEnter={() => setHover(label(day))} onFocus={() => setHover(label(day))} onClick={() => setHover(label(day))}/>)}
          </div>
        </div>
      </div>
      <div className="heatmap-foot"><span aria-live="polite">{hover}</span><span className="legend">Less <i className="l0"/><i className="l1"/><i className="l2"/><i className="l3"/><i className="l4"/> More</span></div>
    </>}
    <div className="github-sync"><span>{error && days ? 'Refresh failed · showing last successful sync' : syncedAt ? `Synced ${syncedAt.toLocaleTimeString()} · refreshes every minute` : 'Fetching GitHub calendar'}</span><a href={`https://github.com/${username}`} target="_blank" rel="noreferrer">View GitHub ↗</a></div>
  </div>;
}
