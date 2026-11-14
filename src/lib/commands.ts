// Pure command table for the hero terminal. Side effects (open links, scroll)
// are returned as actions so this module stays testable without a DOM.
import { site, projects } from '../data/site';

export type Action =
  | { type: 'open'; url: string }
  | { type: 'scroll'; id: string }
  | { type: 'pet' }
  | { type: 'clear' };

export type Result = { output: string; action?: Action };

const table: Record<string, () => Result> = {
  whoami: () => ({
    output:
      'name     Asifur (Asif) Rahman\nrole     backend / platform developer, 2x co-op @ BMO Capital Markets\nschool   final year, CS (Co-op) @ Concordia\nbased    Montreal (open to Toronto / remote)\ntip      type "help" to see everything',
  }),
  help: () => ({
    output:
      'whoami  experience  projects  skills  education  status\nlooking-for  contact  email  github  linkedin  resume\nfun-fact  game  pet  history  clear',
  }),
  experience: () => ({
    output:
      'BMO Capital Markets   Platform & Infrastructure Development\n  Java, Spring Boot, AWS (Lambda, S3, Bedrock), Aurora PostgreSQL,\n  Jenkins, Ansible, Liquibase, CI/CD\nHEXA                  Java, Spring Boot, React, microservices\n→ scroll to ~/experience for details',
  }),
  projects: () => ({
    output:
      projects.map((p) => `${p.repo.split('/').pop()}/`.padEnd(28) + p.summary).join('\n') +
      '\n→ scroll to ~/projects for details',
  }),
  skills: () => ({
    output:
      'languages  Java, Python, TypeScript, SQL, C++\nbackend    Spring Boot, Node.js, Express, REST, microservices\ncloud      AWS (Lambda, S3, Bedrock), Aurora PostgreSQL\ndevops     Jenkins, Ansible, Docker, GitHub Actions, Liquibase',
  }),
  education: () => ({ output: 'Concordia University, Gina Cody School\nB.Comp.Sc. (Co-op), final year' }),
  status: () => ({ output: 'open to work ✓' }),
  'looking-for': () => ({
    output: '2027 software engineering internships and new grad roles.\nBackend, platform or infra. Montreal, Toronto or remote.',
  }),
  contact: () => ({
    output: `email     ${site.email}\nlinkedin  ${site.linkedin.replace('https://', '')}\ngithub    ${site.github.replace('https://', '')}`,
  }),
  email: () => ({ output: `opening mail client… ${site.email}`, action: { type: 'open', url: `mailto:${site.email}` } }),
  github: () => ({ output: 'opening github…', action: { type: 'open', url: site.github } }),
  linkedin: () => ({ output: 'opening linkedin…', action: { type: 'open', url: site.linkedin } }),
  resume: () =>
    site.resume
      ? { output: 'opening resume…', action: { type: 'open', url: site.resume } }
      : { output: `resume available on request: ${site.email}` },
  'fun-fact': () => ({ output: 'This site is Astro + React islands, tested and deployed by GitHub Actions.' }),
  game: () => ({ output: 'scrolling to the game…', action: { type: 'scroll', id: 'break' } }),
  pet: () => ({ output: 'the dog appreciates it ♥', action: { type: 'pet' } }),
  'sudo hire-asif': () => ({ output: `permission granted. reach out: ${site.email}` }),
  clear: () => ({ output: '', action: { type: 'clear' } }),
};
table.ls = table.projects;

export const chips = [
  'whoami', 'experience', 'projects', 'skills', 'looking-for', 'contact', 'resume', 'game', 'pet', 'sudo hire-asif', 'help', 'clear',
];

export function runCommand(raw: string, history: string[] = []): Result | null {
  const c = raw.trim();
  if (!c) return null;
  if (c === 'history') return { output: history.join('\n') || '(empty)' };
  const f = table[c] ?? table[c.toLowerCase()];
  return f ? f() : { output: `command not found: ${c}\ntype "help" for a list` };
}
