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
  'Asifur Rahman, software developer.\nFinal-year CS @ Concordia. 2x co-op @ BMO Capital Markets.\nType "help" to look around.';

// Short names for `open <name>`; values are project ids in site.ts.
export const projectAliases: Record<string, string> = {
  campusshare: 'campusshare', grpc: 'campusshare', bixi: 'bixi', booking: 'booking', hammerfall: 'engine', engine: 'engine',
};

const pad = (s: string, n: number) => s.padEnd(n);
const bullet = (s: string) => `  • ${s}`; // the terminal renders "  • " lines with a hanging indent

// Commands listed by `help` (and cycled with the arrow keys), with their descriptions.
const HELP: [command: string, description: string][] = [
  ['about', 'who I am'],
  ['experience', "where I've worked"],
  ['skills', 'what I work with'],
  ['contact', 'how to reach me'],
  ['resume', 'download my resume'],
  ['clear', 'clear the screen'],
];
export const helpCommands = HELP.map(([c]) => c);

const table: Record<string, (arg: string) => Result> = {
  help: () => ({ output: HELP.map(([c, d]) => pad(c, 13) + d).join('\n') }),
  about: () => ({
    output: 'Asifur Rahman, software developer.\nFinal-year CS @ Concordia, 4x internship terms completed.\nOpen to 2027 internships and new grad roles.\nType "resume" to download my resume.',
  }),
  experience: (arg) => {
    if (arg) {
      const j = experience.find((x) => x.key === arg);
      if (!j) return { output: `no role called "${arg}". try: ${experience.map((x) => x.key).join(', ')}` };
      return { output: [`${j.title}  |  ${j.dates}`, `${j.org}, ${j.place}`, ...j.bullets.map(bullet)].join('\n') };
    }
    const w1 = Math.max(...experience.map((j) => j.short.length)) + 3;
    const w2 = Math.max(...experience.map((j) => j.title.length)) + 3;
    return {
      output: experience.map((j) => pad(j.short, w1) + pad(j.title, w2) + j.company).join('\n'),
    };
  },
  skills: () => ({ output: skills.map(([k, v]) => bullet(`${k}: ${v}`)).join('\n') }),
  education: () => ({
    output: [
      `${education.school}, ${education.place}`,
      `${education.degree}  |  ${education.dates}`,
      bullet(`Coursework: ${education.coursework}`),
    ].join('\n'),
  }),
  // hidden: projects are shown on the page below
  projects: () => ({
    output:
      projects.map((p) => {
        const name = Object.keys(projectAliases).find((k) => projectAliases[k] === p.id) ?? p.id;
        return pad(name, 12) + p.title.split(':')[0];
      }).join('\n') + '\nType "open <name>" to jump to it below.',
  }),
  open: (arg) => {
    const id = projectAliases[arg.toLowerCase()];
    if (!id) return { output: `no project called "${arg}". try: ${Object.keys(projectAliases).filter((k) => k !== 'engine' && k !== 'grpc').join(', ')}` };
    return { output: `opening ${arg}…`, action: { type: 'project', id } };
  },
  'git log': () => ({ output: 'fetching commits…', action: { type: 'gitlog' } }),
  contact: () => ({
    output: `email     ${site.email}\nschool    ${site.schoolEmail}\nlinkedin  ${site.linkedin.replace('https://', '')}\ngithub    ${site.github.replace('https://', '')}`,
  }),
  email: () => ({ output: `opening mail client… ${site.email}`, action: { type: 'open', url: `mailto:${site.email}` } }),
  github: () => ({ output: 'opening github…', action: { type: 'open', url: site.github } }),
  linkedin: () => ({ output: 'opening linkedin…', action: { type: 'open', url: site.linkedin } }),
  resume: () =>
    site.resume
      ? { output: 'downloading resume…', action: { type: 'open', url: site.resume } }
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

/** Arrow-key browsing of helpCommands: the first press shows the first command, then it wraps both ways. */
export function cycleCommand(current: number | null, step: 1 | -1, n = helpCommands.length): number {
  if (current === null) return 0;
  return (current + step + n) % n;
}

export function runCommand(raw: string, history: string[] = []): Result | null {
  const c = raw.trim().replace(/\s+/g, ' ');
  if (!c) return null;
  const lower = c.toLowerCase();
  if (lower === 'history') return { output: history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join('\n') || '(empty)' };
  if (table[lower]) return table[lower]('');
  const [cmd, ...rest] = lower.split(' ');
  if (cmd === 'open' && rest.length) return table.open(rest.join(' '));
  if (cmd === 'experience' && rest.length) return table.experience(rest.join(' '));
  if (cmd === 'cd') return { output: 'this is a one-page site. try "open bixi" or "help"' };
  return { output: `command not found: ${c}\ntype "help" for a list` };
}

/** Format commits from the GitHub activity map for `git log`. */
export function formatGitLog(rows: { repo: string; sha: string; message: string; when: string }[]): string {
  if (!rows.length) return 'could not reach GitHub right now. see github.com/asifur-rahman9';
  const w = Math.max(...rows.map((r) => r.repo.length));
  return rows.map((r) => `${r.sha}  ${pad(r.repo, w)}  ${r.message}  (${r.when})`).join('\n');
}
