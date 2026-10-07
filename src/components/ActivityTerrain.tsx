import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { getGitHubContributions } from '../data/githubContributions';

type Point = { date: string; count: number };
const lcQuery = `query user($username:String!){matchedUser(username:$username){userCalendar{submissionCalendar}}}`;
const lcEndpoint = import.meta.env.VITE_LEETCODE_API_URL || '/api/leetcode/graphql';

function activityWeeks(values: Map<string, number>) {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: 56 }, (_, index) => {
    const end = new Date(today); end.setUTCDate(today.getUTCDate() - (55 - index) * 7);
    let count = 0;
    for (let offset = 0; offset < 7; offset += 1) { const day = new Date(end); day.setUTCDate(end.getUTCDate() - offset); count += values.get(day.toISOString().slice(0, 10)) || 0; }
    return { date: end.toISOString().slice(0, 10), count };
  });
}

function TerrainMesh({ points, mode, onHover }: { points: Point[]; mode: 'github' | 'leetcode'; onHover: (text: string) => void }) {
  const palette = mode === 'github' ? { base: '#17434b', active: '#00bd8d', top: '#91f7df' } : { base: '#4d351a', active: '#df8d14', top: '#ffe174' };
  return <group rotation={[0, -0.35, 0]}>{points.map((point, index) => { const col = index % 8; const row = Math.floor(index / 8); const live = point.count > 0; const h = live ? .8 + Math.min(7, point.count) * .47 : .18 + ((index * 13) % 3) * .09; const color = live ? palette.active : palette.base; return <mesh key={point.date} position={[(col - 3.5) * .95, h / 2, (row - 3) * .95]} onPointerOver={(event) => { event.stopPropagation(); onHover(`${point.count} ${mode === 'github' ? 'GitHub events' : 'LeetCode submissions'} in the week ending ${new Date(point.date + 'T00:00:00').toLocaleDateString()}`); }}><boxGeometry args={[.8, h, .8]}/><meshStandardMaterial color={color} roughness={.38} metalness={.12}/></mesh>; })}<mesh position={[0, -.08, 0]} receiveShadow><boxGeometry args={[8.7, .16, 7.4]}/><meshStandardMaterial color="#101820" roughness={.7}/></mesh></group>;
}

function Scene({ points, mode, onHover }: { points: Point[]; mode: 'github' | 'leetcode'; onHover: (text: string) => void }) { return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [7.7, 7.1, 8.8], fov: 39 }}><color attach="background" args={['#0d0f16']}/><ambientLight intensity={1.1}/><directionalLight position={[5, 8, 4]} intensity={2.4} color="#d7fff6" castShadow/><pointLight position={[-5, 4, -3]} intensity={12} color={mode === 'github' ? '#00d6a0' : '#ffb32b'} distance={10}/><TerrainMesh points={points} mode={mode} onHover={onHover}/><OrbitControls enablePan={false} minDistance={7} maxDistance={14} minPolarAngle={.45} maxPolarAngle={1.45} target={[0, .6, 0]}/></Canvas>; }

export function ActivityTerrain({ github, leetcode }: { github: string; leetcode: string }) {
  const [active, setActive] = useState<'github' | 'leetcode'>('github'); const [githubData, setGithubData] = useState<Point[]>([]); const [leetcodeData, setLeetcodeData] = useState<Point[]>([]); const [hover, setHover] = useState('Drag to orbit · hover a pillar for real weekly activity');
  useEffect(() => { getGitHubContributions(github).then(days => setGithubData(activityWeeks(new Map(days.map(day => [day.date, day.count]))))).catch(() => {}); }, [github]);
  useEffect(() => { fetch(lcEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: lcQuery, variables: { username: leetcode } }) }).then(r => r.ok ? r.json() : Promise.reject()).then(result => { const raw = JSON.parse(result.data.matchedUser.userCalendar.submissionCalendar || '{}') as Record<string, number>; setLeetcodeData(activityWeeks(new Map(Object.entries(raw).map(([stamp, count]) => [new Date(Number(stamp) * 1000).toISOString().slice(0, 10), count])))); }).catch(() => {}); }, [leetcode]);
  const points = active === 'github' ? githubData : leetcodeData; const total = useMemo(() => points.reduce((sum, point) => sum + point.count, 0), [points]);
  return <div className={`terrain webgl-terrain ${active}`}><div className="terrain-top"><div className="terrain-tabs"><button className={active === 'github' ? 'on' : ''} onClick={() => setActive('github')}>GITHUB 3D</button><button className={active === 'leetcode' ? 'on' : ''} onClick={() => setActive('leetcode')}>LEETCODE 3D</button></div><b>{total} {active === 'github' ? 'EVENTS' : 'SUBMISSIONS'}</b></div><div className="terrain-stage"><Scene points={points} mode={active} onHover={setHover}/></div><div className="terrain-bottom"><span>{hover}</span><span>LIVE 3D DATA TERRAIN</span></div></div>;
}
