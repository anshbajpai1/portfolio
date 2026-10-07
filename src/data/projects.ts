export type Project = { title: string; description: string; stack: string[]; accent: string; live?: string; github?: string };
export const projects: Project[] = [
  { title: 'Schoolix', description: 'A comprehensive school ERP for student management, attendance, fees, reports, and administrative workflows.', stack: ['React', 'Supabase', 'Firebase'], accent: 'blue', live: 'https://schoolix.netlify.app' },
  { title: 'Trendora', description: 'A modern e-commerce experience that makes product discovery feel focused, fluid, and personal.', stack: ['React', 'JavaScript', 'Firebase'], accent: 'violet', live: 'https://trendora2.netlify.app' },
  { title: 'BS Education Centre', description: 'An education-centre website designed to clearly present learning resources, programmes, and essential information.', stack: ['Web Development', 'JavaScript', 'Database'], accent: 'cyan', live: 'https://bseducationsarsaul.in' },
  { title: 'Township Experts', description: 'A polished real-estate destination built to make browsing properties simple and compelling.', stack: ['HTML', 'CSS', 'JavaScript'], accent: 'amber', live: 'https://townshipexperts.netlify.app' },
];
