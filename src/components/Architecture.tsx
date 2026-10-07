import { useState } from 'react';
import { motion } from 'motion/react';

const nodes = [
  { name: 'Frontend', tech: 'React + TypeScript', detail: 'Responsive interfaces, component systems, and interaction design.', flow: 'Visitor actions are validated and sent to REST APIs.' },
  { name: 'Backend', tech: 'Java / Serverless', detail: 'Business logic, secure integrations, and application services.', flow: 'Services coordinate requests between UI, authentication, and data.' },
  { name: 'Database', tech: 'Supabase / Firebase', detail: 'Structured application data and real-time capable workflows.', flow: 'Data is read and written through authenticated service calls.' },
  { name: 'Authentication', tech: 'Supabase Auth / Firebase Auth', detail: 'Identity-aware access for protected product experiences.', flow: 'A session token authorizes requests before data reaches services.' },
  { name: 'APIs', tech: 'REST APIs', detail: 'Clear contracts that connect interfaces to services and third parties.', flow: 'Typed requests keep the product surface predictable.' },
  { name: 'Cloud', tech: 'Vercel / Firebase', detail: 'Fast delivery, hosted services, and scalable deployment.', flow: 'Edge delivery serves the app close to the visitor.' },
] as const;

export function Architecture() {
  const [selected, setSelected] = useState(0); const node = nodes[selected];
  return <section className="section architecture" id="architecture"><p className="eyebrow">05 — SYSTEM THINKING</p><h2>Built as a connected system.</h2><div className="arch-grid"><div className="node-map" aria-label="Interactive system architecture">{nodes.map((n, i) => <motion.button key={n.name} className={`arch-node n${i} ${selected === i ? 'selected' : ''}`} onClick={() => setSelected(i)} whileHover={{scale:1.06}}><i/><span>{n.name}</span><small>{n.tech}</small></motion.button>)}<svg viewBox="0 0 600 380" aria-hidden="true"><path d="M130 95 C250 95 260 160 350 160 M130 280 C250 280 260 210 350 210 M450 160 C520 160 530 100 570 80 M450 210 C520 210 530 280 570 300"/></svg></div><motion.aside key={node.name} className="arch-detail" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}}><span className="detail-index">ACTIVE COMPONENT / 0{selected + 1}</span><h3>{node.name}</h3><p className="tech">{node.tech}</p><p>{node.detail}</p><div><b>DATA FLOW</b><span>{node.flow}</span></div></motion.aside></div></section>;
}
