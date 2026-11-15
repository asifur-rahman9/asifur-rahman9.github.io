// Command table for the hero terminal. Pure: side effects (open links, scroll, pet the dog,
// fetch commits) are returned as actions so this module is testable without a DOM.
import { site, projects, experience, skills, education } from '../data/site';

export type Action =
  | { type: 'open'; url: string }
  | { type: 'scroll'; id: string }
  | { type: 'project'; id: string }
  | { type: 'pet' }
  | { type: 'sip' }
  | { type: 'gitlog' }
  | { type: 'clear' };

export type Result = { output: string; action?: Action };

export const banner =
  'Asifur Rahman, backend and platform developer.\nFinal-year CS @ Concordia. 2x co-op @ BMO Capital Markets.\nType "help" to look around.';

// Short names for `open <name>`; values are project ids in site.ts.
export const projectAliases: Record<string, string> = {
  bixi: 'bixi', booking: 'booking', hammerfall: 'engine', engine: 'engine',
};

const pad = (s: string, n: number) => s.padEnd(n);
const bullet = (s: string) => `  • ${s}`; // the terminal renders "  • " lines with a hanging indent

const table: Record<string, (arg: string) => Result> = {
  help: () => ({
    output: [
      ['about', 'who I am'],
      ['experience', "where I've worked"],
      ['projects', "what I've built (try: open bixi)"],
      ['skills', 'languages, frameworks, infra'],
      ['education', 'school and graduation'],
      ['now', "what I'm working on right now"],
      ['git log', 'my latest commits, live from GitHub'],
      ['contact', 'how to reach me'],
      ['resume', 'get my resume'],
      ['clear', 'clear the screen'],
    ].map(([c, d]) => pad(c, 13) + d).join('\n'),
  }),
  about: () => ({
    output:
      "I'm Asif, a backend and platform developer in Montreal.\nI like the unglamorous parts: CI pipelines, database\nmigrations, and services that stay up.\nOpen to Summer 2027 internships and new grad roles\nin Montreal, Toronto or remote.",
  }),
  experience: () => ({
    output: experience
      .map((j) => [`${j.title}  |  ${j.dates}`, `${j.org}, ${j.place}`, ...j.bullets.map(bullet)].join('\n'))
      .join('\n\n'),
  }),
  projects: () => ({
    output:
      projects.map((p) => {
        const name = Object.keys(projectAliases).find((k) => projectAliases[k] === p.id) ?? p.id;
        return pad(name, 12) + pad(p.title.split(':')[0], 28) + p.stack.slice(0, 3).join(', ');
      }).join('\n') + '\nType "open <name>" to jump to it below.',
  }),
  open: (arg) => {
    const id = projectAliases[arg.toLowerCase()];
    if (!id) return { output: `no project called "${arg}". try: ${Object.keys(projectAliases).filter((k) => k !== 'engine').join(', ')}` };
    return { output: `opening ${arg}…`, action: { type: 'project', id } };
  },
  skills: () => ({ output: skills.map(([k, v]) => bullet(`${k}: ${v}`)).join('\n') }),
  education: () => ({
    output: [
      `${education.school}, ${education.place}`,
      `${education.degree}  |  ${education.dates}`,
      bullet(`Coursework: ${education.coursework}`),
    ].join('\n'),
  }),
  now: () => ({
    output: '  • Finishing my last study terms at Concordia\n  • Interviewing for Summer 2027 internships\n  • Building live data into my portfolio projects',
  }),
  'git log': () => ({ output: 'fetching commits…', action: { type: 'gitlog' } }),
  contact: () => ({
    output: `email     ${site.email}\nschool    ${site.schoolEmail}\nlinkedin  ${site.linkedin.replace('https://', '')}\ngithub    ${site.github.replace('https://', '')}\nType "email" to open your mail app.`,
  }),
  email: () => ({ output: `opening mail client… ${site.email}`, action: { type: 'open', url: `mailto:${site.email}` } }),
  github: () => ({ output: 'opening github…', action: { type: 'open', url: site.github } }),
  linkedin: () => ({ output: 'opening linkedin…', action: { type: 'open', url: site.linkedin } }),
  resume: () =>
    site.resume
      ? { output: 'opening resume…', action: { type: 'open', url: site.resume } }
      : { output: `resume available on request: ${site.email}` },
  clear: () => ({ output: '', action: { type: 'clear' } }),
  // hidden extras (not listed in help)
  'sudo hire-asif': () => ({ output: `permission granted. reach out: ${site.email}` }),
  pet: () => ({ output: 'the duck appreciates it ♥ quack!', action: { type: 'pet' } }),
  coffee: () => ({ output: 'brewing… ☕ done. he takes a sip.', action: { type: 'sip' } }),
  exit: () => ({ output: "there's no escape. try 'contact' instead" }),
  'rm -rf /': () => ({ output: 'nice try' }),
  game: () => ({ output: 'scrolling to the game…', action: { type: 'scroll', id: 'break' } }),
};
table.whoami = table.about;
table.ls = table.projects;

/** Command names, for tab completion (hidden extras included, like a real shell). */
export const commandNames = () => Object.keys(table).concat('history');
export const helpCommands = ['about', 'experience', 'projects', 'skills', 'education', 'now', 'git log', 'contact', 'resume', 'clear'];

export function runCommand(raw: string, history: string[] = []): Result | null {
  const c = raw.trim().replace(/\s+/g, ' ');
  if (!c) return null;
  const lower = c.toLowerCase();
  if (lower === 'history') return { output: history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join('\n') || '(empty)' };
  if (table[lower]) return table[lower]('');
  const [cmd, ...rest] = lower.split(' ');
  if (cmd === 'open' && rest.length) return table.open(rest.join(' '));
  if (cmd === 'cd') return { output: 'this is a one-page site. try "open bixi" or "help"' };
  return { output: `command not found: ${c}\ntype "help" for a list` };
}

/** Format commits from the GitHub activity map for `git log`. */
export function formatGitLog(rows: { repo: string; sha: string; message: string; when: string }[]): string {
  if (!rows.length) return 'could not reach GitHub right now. see github.com/asifur-rahman9';
  const w = Math.max(...rows.map((r) => r.repo.length));
  return rows.map((r) => `${r.sha}  ${pad(r.repo, w)}  ${r.message}  (${r.when})`).join('\n');
}
