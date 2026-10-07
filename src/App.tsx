import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, ChevronRight, Code2, Copy, GithubIcon, LinkedinIcon, Mail, Menu, Moon, MoveUpRight, Sun, X } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { projects } from './data/projects';
import { skillGroups } from './data/skills';
import { profile } from './data/profile';
import { Architecture } from './components/Architecture';
import { Assistant } from './components/Assistant';
import { ContributionHeatmap } from './components/ContributionHeatmap';
import { LeetCodeActivity } from './components/LeetCodeActivity';
import { ActivityTerrain } from './components/ActivityTerrain';
import portrait from '../image.jpg';

const email = profile.email;
const githubUser = import.meta.env.VITE_GITHUB_USERNAME || profile.github;
const leetcodeUser = import.meta.env.VITE_LEETCODE_USERNAME || profile.leetcode;
const nav = ['Home', 'About', 'Skills', 'Projects', 'Coding Stats', 'Contact'];

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return <section id={id} className="section"><motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: .7 }}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children}</motion.div></section>;
}

function Orb() {
  const x = useMotionValue(0); const y = useMotionValue(0); const sx = useSpring(x, { stiffness: 120, damping: 18 }); const sy = useSpring(y, { stiffness: 120, damping: 18 });
  return <div className="orb-wrap" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) / 12); y.set((e.clientY - r.top - r.height / 2) / 12); }} onMouseLeave={() => { x.set(0); y.set(0); }}>
    <motion.div className="orb" style={{ x: sx, y: sy }}><i /><i /><i /><span>SB</span></motion.div>
    <div className="code-float f1"><small>const</small> impact = <b>true</b>;</div><div className="code-float f2">&lt;/<b>create</b>&gt;</div><div className="orb-label">01 / 01<br/><b>CREATIVE<br/>SYSTEMS</b></div>
  </div>;
}

function GithubStats() {
  const [data, setData] = useState<{ public_repos: number; followers: number } | null>(null); const [status, setStatus] = useState<'loading' | 'ready' | 'empty'>('loading');
  useEffect(() => { if (!githubUser) { setStatus('empty'); return; } fetch(`${import.meta.env.VITE_GITHUB_API_URL || 'https://api.github.com'}/users/${githubUser}`).then(r => r.ok ? r.json() : Promise.reject()).then(d => { setData(d); setStatus('ready'); }).catch(() => setStatus('empty')); }, []);
  return <div className="stat-panel"><div className="stat-top"><div><span className="dot" /> GITHUB ACTIVITY</div>{githubUser && <a href={`https://github.com/${githubUser}`} target="_blank">View profile <ArrowUpRight size={14}/></a>}</div>{status === 'ready' && data ? <><div className="metric"><b>{data.public_repos}</b><span>Public repositories</span></div><div className="metric"><b>{data.followers}</b><span>GitHub followers</span></div><p className="note">Contribution history is available when a secure GraphQL-backed endpoint is configured.</p></> : <div className="empty-state"><GithubIcon size={24}/><strong>Connect GitHub to see live activity.</strong><span>Add VITE_GITHUB_USERNAME to your local environment.</span></div>}</div>;
}

function App() {
  const [menu, setMenu] = useState(false); const [copied, setCopied] = useState(false); const [role, setRole] = useState(0); const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark'); const roles = ['Full Stack Developer', 'Problem Solver', 'Creative Engineer'];
  useEffect(() => { const i = setInterval(() => setRole(v => (v + 1) % roles.length), 2400); return () => clearInterval(i); }, []);
  useEffect(() => { localStorage.setItem('portfolio-theme', theme); document.documentElement.style.colorScheme = theme; }, [theme]);
  const copyEmail = async () => { await navigator.clipboard?.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const scroll = (target: string) => { document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }); setMenu(false); };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); window.location.href = `mailto:${email}?subject=${encodeURIComponent(String(f.get('subject') || 'Portfolio enquiry'))}&body=${encodeURIComponent(`Name: ${f.get('name')}\nEmail: ${f.get('email')}\n\n${f.get('message')}`)}`; };
  return <main className={theme === 'light' ? 'light-theme' : ''}>
    <div className="noise"/><div className="cursor-glow"/>
    <header><button className="logo" onClick={() => scroll('home')}>SB<span>.</span></button><nav className={menu ? 'open' : ''}>{nav.map(n => <button key={n} onClick={() => scroll(n === 'Coding Stats' ? 'coding' : n.toLowerCase())}>{n}</button>)}<a className="status"><i/> Open to opportunities</a><button className="theme-toggle" onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-pressed={theme === 'light'}>{theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button></nav><button className="menu" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X/> : <Menu/>}</button></header>
    <section id="home" className="hero"><div className="hero-copy"><motion.p className="availability" initial={{opacity:0}} animate={{opacity:1}}><span/> AVAILABLE FOR OPPORTUNITIES</motion.p><div className="hero-identity"><img src={portrait} alt="Shreshtha Bajpai"/><span>SHRESHTHA BAJPAI · DEVELOPER</span></div><motion.h1 initial={{opacity:0,y:34}} animate={{y:0,opacity:1}} transition={{duration:.8}}>Hi, I’m<br/><em>Shreshtha Bajpai.</em></motion.h1><div className="kinetic"><span>I BUILD THINGS FOR</span><motion.b key={roles[role]} initial={{y:24,opacity:0}} animate={{y:0,opacity:1}}>{roles[role]}</motion.b></div><p className="lede">I’m a developer passionate about building modern digital experiences, solving complex problems, and transforming ideas into functional products.</p><div className="actions"><button className="primary" onClick={() => scroll('projects')}>Explore my work <ArrowDownRight/></button><button className="ghost" onClick={() => scroll('contact')}>Let’s connect <ArrowUpRight/></button></div></div><ActivityTerrain github={githubUser} leetcode={leetcodeUser}/><button className="scroll" onClick={() => scroll('about')}><span>SCROLL TO EXPLORE</span><ArrowDownRight/></button></section>
    <Section id="about" eyebrow="01 — INTRODUCTION" title="A little about me."><div className="about-grid"><p className="body-copy">I’m Shreshtha Bajpai, a developer focused on thoughtful interfaces, reliable integrations, and the systems that make products useful. I enjoy moving between frontend craft, backend logic, data, and problem-solving.<br/><br/>I care about the full journey: turning a vague idea into a clear, responsive experience that works beautifully in the real world.</p><div className="profile-card"><img className="profile-photo" src={portrait} alt="Shreshtha Bajpai in the mountains"/><p>{profile.location}<br/><b>{profile.education.toUpperCase()}</b></p><div className="profile-line"/></div></div></Section>
    <Section id="skills" eyebrow="02 — TOOLKIT" title="Technology, with intent."><p className="intro">A versatile toolkit for turning ambitious ideas into thoughtful, dependable products.</p><div className="skills-grid">{skillGroups.map(([group, skills], i) => <motion.article className="skill-group" key={group} whileHover={{ y: -6 }} transition={{type:'spring', stiffness:300}}><span>0{i+1}</span><h3>{group}</h3><div>{skills.map(s => <b key={s}>{s}</b>)}</div></motion.article>)}</div></Section>
    <Section id="projects" eyebrow="03 — SELECTED WORK" title="Ideas, made tangible."><div className="project-list">{projects.map((p, i) => <motion.a href={p.live} target="_blank" rel="noreferrer" className={`project ${p.accent}`} key={p.title} initial={{opacity:0,y:25}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.07}} aria-label={`Open ${p.title}`}><div className="project-index">0{i+1}</div><div className="project-art"><div className="art-window"><span/><span/><span/><b>{p.title.slice(0, 2).toUpperCase()}</b></div></div><div className="project-details"><h3>{p.title}</h3><p>{p.description}</p><div className="tags">{p.stack.map(s => <span key={s}>{s}</span>)}</div></div><span aria-hidden="true" className="round"><ArrowUpRight/></span></motion.a>)}</div><p className="replace-note">Select any project to visit its live website.</p></Section>
    <Section id="coding" eyebrow="04 — CODE IN MOTION" title="Engineering activity."><ContributionHeatmap username={githubUser}/><LeetCodeActivity username={leetcodeUser}/><div className="coding-grid"><GithubStats/><div className="stat-panel leetcode"><div className="stat-top"><div><span className="dot violet"/> VERIFIED SOURCES</div></div><div className="empty-state"><Code2 size={24}/><strong>Public profiles, live data.</strong><span>GitHub and LeetCode dashboards refresh directly from their public APIs.</span></div></div></div></Section>
    <Architecture/>
    <Section id="journey" eyebrow="07 — EVOLUTION" title="My development journey."><div className="timeline">{['Learning programming fundamentals', 'Exploring frontend development', 'Working with databases & APIs', 'Building full-stack projects', 'Exploring mobile application development', 'Practicing DSA daily'].map((x, i) => <div className="timeline-item" key={x}><span>0{i+1}</span><i/><p>{x}</p><ChevronRight/></div>)}</div></Section>
    <Assistant/>
    <section id="contact" className="contact"><p className="eyebrow">06 — START A CONVERSATION</p><h2>Have an idea?<br/><em>Let’s build it great.</em></h2><div className="contact-grid"><div><a className="email" href={`mailto:${email}`}>{email}<ArrowUpRight/></a><button className="copy" onClick={copyEmail}>{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? 'Copied' : 'Copy email'}</button><div className="socials"><a href={profile.githubUrl} target="_blank" aria-label="Github"><GithubIcon/></a><a href={profile.linkedinUrl} target="_blank" aria-label="LinkedIn"><LinkedinIcon/></a><a href={`mailto:${email}`} aria-label="Email"><Mail/></a></div></div><form onSubmit={onSubmit}><label>Name<input required name="name" placeholder="Your name"/></label><label>Email<input required type="email" name="email" placeholder="you@example.com"/></label><label>Subject<input name="subject" placeholder="What’s on your mind?"/></label><label>Message<textarea required name="message" placeholder="Tell me a little about the idea…"/></label><button className="primary">Send inquiry <MoveUpRight/></button></form></div></section>
    <footer><span>© {new Date().getFullYear()} Shreshtha Bajpai</span><span>DESIGNED & BUILT WITH INTENT</span><button onClick={() => scroll('home')}>Back to top ↑</button></footer>
  </main>;
}
export default App;
