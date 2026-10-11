import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { getGitHubContributions } from '../data/githubContributions';

type Point = { date: string; count: number };
const lcQuery = `query user($username:String!){matchedUser(username:$username){userCalendar{submissionCalendar}}}`;
const lcEndpoint = import.meta.env.VITE_LEETCODE_API_URL || '/api/leetcode/graphql';

function activityWeeks(values: Map<string, number>, latestDate?: string) {
  const today = latestDate ? new Date(`${latestDate}T00:00:00Z`) : new Date(); today.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: 56 }, (_, index) => {
    const end = new Date(today); end.setUTCDate(today.getUTCDate() - (55 - index) * 7);
    let count = 0;
    for (let offset = 0; offset < 7; offset += 1) { const day = new Date(end); day.setUTCDate(end.getUTCDate() - offset); count += values.get(day.toISOString().slice(0, 10)) || 0; }
    return { date: end.toISOString().slice(0, 10), count };
  });
}

function TerrainMesh({ points, mode, onHover }: { points: Point[]; mode: 'github' | 'leetcode'; onHover: (text: string) => void }) {
  const palette = mode === 'github' ? { base: '#17434b', active: '#00bd8d', top: '#91f7df' } : { base: '#4d351a', active: '#df8d14', top: '#ffe174' };
  const isGitHub = mode === 'github';
  const columns = isGitHub ? 53 : 8; const spacing = isGitHub ? .34 : .95; const rowSpacing = isGitHub ? .62 : .95;
  const width = isGitHub ? 18.3 : 8.7; const depth = isGitHub ? 5 : 7.4;
  return <group rotation={[0, isGitHub ? -.17 : -.35, 0]}>{points.map((point, index) => { const col = isGitHub ? Math.floor(index / 7) : index % 8; const row = isGitHub ? index % 7 : Math.floor(index / 8); const live = point.count > 0; const h = live ? (isGitHub ? .32 : .8) + Math.min(7, point.count) * (isGitHub ? .25 : .47) : .12 + ((index * 13) % 3) * .045; const color = live ? palette.active : palette.base; const label = isGitHub ? `${point.count} GitHub contribution${point.count === 1 ? '' : 's'} on ${new Date(point.date + 'T00:00:00').toLocaleDateString()}` : `${point.count} LeetCode submissions in the week ending ${new Date(point.date + 'T00:00:00').toLocaleDateString()}`; return <mesh key={point.date} position={[(col - (columns - 1) / 2) * spacing, h / 2, (row - 3) * rowSpacing]} onPointerOver={(event) => { event.stopPropagation(); onHover(label); }}><boxGeometry args={[isGitHub ? .27 : .8, h, isGitHub ? .49 : .8]}/><meshStandardMaterial color={color} roughness={.38} metalness={.12}/></mesh>; })}<mesh position={[0, -.08, 0]} receiveShadow><boxGeometry args={[width, .16, depth]}/><meshStandardMaterial color="#101820" roughness={.7}/></mesh></group>;
}

function Scene({ points, mode, onHover }: { points: Point[]; mode: 'github' | 'leetcode'; onHover: (text: string) => void }) { const github = mode === 'github'; return <Canvas key={mode} shadows dpr={[1, 1.5]} camera={{ position: github ? [0, 8.6, 13.8] : [7.7, 7.1, 8.8], fov: github ? 37 : 39 }}><color attach="background" args={['#0d0f16']}/><ambientLight intensity={1.1}/><directionalLight position={[5, 8, 4]} intensity={2.4} color="#d7fff6" castShadow/><pointLight position={[-5, 4, -3]} intensity={12} color={github ? '#00d6a0' : '#ffb32b'} distance={github ? 22 : 10}/><TerrainMesh points={points} mode={mode} onHover={onHover}/><OrbitControls enablePan={false} minDistance={github ? 12 : 7} maxDistance={github ? 24 : 14} minPolarAngle={.45} maxPolarAngle={1.45} target={[0, .6, 0]}/></Canvas>; }

export function ActivityTerrain({ github, leetcode }: { github: string; leetcode: string }) {
  const [active, setActive] = useState<'github' | 'leetcode'>('github'); const [githubData, setGithubData] = useState<Point[] | null>(null); const [githubError, setGithubError] = useState(false); const [leetcodeData, setLeetcodeData] = useState<Point[]>([]); const [hover, setHover] = useState('Drag to orbit · hover a pillar for real weekly activity');
  useEffect(() => { setGithubData(null); setGithubError(false); getGitHubContributions(github).then(days => setGithubData(days.slice(-365))).catch(() => setGithubError(true)); }, [github]);
  useEffect(() => { fetch(lcEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: lcQuery, variables: { username: leetcode } }) }).then(r => r.ok ? r.json() : Promise.reject()).then(result => { const raw = JSON.parse(result.data.matchedUser.userCalendar.submissionCalendar || '{}') as Record<string, number>; setLeetcodeData(activityWeeks(new Map(Object.entries(raw).map(([stamp, count]) => [new Date(Number(stamp) * 1000).toISOString().slice(0, 10), count])))); }).catch(() => {}); }, [leetcode]);
  const points = active === 'github' ? (githubData || []) : leetcodeData; const total = useMemo(() => points.reduce((sum, point) => sum + point.count, 0), [points]);
  const githubStatus = githubError ? 'UNAVAILABLE' : githubData ? `${total} CONTRIBUTIONS` : 'SYNCING';
  return <div className={`terrain webgl-terrain ${active}`}><div className="terrain-top"><div className="terrain-tabs"><button className={active === 'github' ? 'on' : ''} onClick={() => setActive('github')}>GITHUB 3D</button><button className={active === 'leetcode' ? 'on' : ''} onClick={() => setActive('leetcode')}>LEETCODE 3D</button></div><b>{active === 'github' ? githubStatus : `${total} SUBMISSIONS`}</b></div><div className="terrain-stage"><Scene points={points} mode={active} onHover={setHover}/></div><div className="terrain-bottom"><span>{githubError && active === 'github' ? 'GitHub contribution data could not be reached right now.' : hover}</span><span>{active === 'github' ? '365 DAILY BARS · LIVE DATA' : 'LIVE 3D DATA TERRAIN'}</span></div></div>;
}
