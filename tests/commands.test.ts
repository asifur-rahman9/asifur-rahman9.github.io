import { describe, expect, it } from 'vitest';
import { runCommand, helpCommands, formatGitLog, commandNames, cycleCommand } from '../src/lib/commands';
import { experience } from '../src/data/site';

describe('terminal commands', () => {
  it('ignores empty input', () => expect(runCommand('   ')).toBeNull());
  it('is case-insensitive and collapses spaces', () => {
    expect(runCommand('  WHOAMI ')?.output).toContain('Asifur Rahman');
    expect(runCommand('git   log')?.action).toEqual({ type: 'gitlog' });
  });
  it('reports unknown commands', () => expect(runCommand('make coffee')?.output).toMatch(/command not found/));
  it('every command listed in help works', () => {
    for (const c of helpCommands) expect(runCommand(c)?.output).not.toMatch(/command not found/);
  });
  it('summarises experience with dates, details on request', () => {
    const out = runCommand('experience')!.output;
    for (const j of experience) { expect(out).toContain(j.short); expect(out).toContain(j.company); }
    for (const j of experience) for (const b of j.bullets) expect(runCommand(`experience ${j.key}`)!.output).toContain(b);
    expect(runCommand('experience nope')!.output).toMatch(/no role/);
  });
  it('opens projects by short name', () => {
    expect(runCommand('open hammerfall')?.action).toEqual({ type: 'project', id: 'hammerfall' });
    expect(runCommand('open GRPC')?.action).toEqual({ type: 'project', id: 'campusshare' }); // alias
    expect(runCommand('open nope')?.output).toBe('no project called "nope". try: campusshare, booking, hammerfall, bixi');
  });
  it('returns side effects as actions', () => {
    expect(runCommand('github')?.action).toEqual({ type: 'open', url: 'https://github.com/asifur-rahman9' });
    expect(runCommand('clear')?.action).toEqual({ type: 'clear' });
    expect(runCommand('coffee')?.action).toEqual({ type: 'sip' });
    expect(runCommand('resume')?.action).toEqual({ type: 'open', url: '/resume.pdf' });
  });
  it('numbers history', () => expect(runCommand('history', ['help', 'skills'])?.output).toBe('  1  help\n  2  skills'));
  it('completes hidden commands too', () => expect(commandNames()).toContain('coffee'));
  it('formats git log rows', () => {
    expect(formatGitLog([{ repo: 'a', sha: '1234567', message: 'm', when: '1 day ago' }])).toBe('1234567  a  m  (1 day ago)');
    expect(formatGitLog([])).toMatch(/could not reach/);
  });
  it('cycles through the help commands with the arrow keys, wrapping both ways', () => {
    const n = helpCommands.length;
    expect(cycleCommand(null, 1)).toBe(0);
    expect(cycleCommand(null, -1)).toBe(0);
    expect(cycleCommand(0, 1)).toBe(1);
    expect(cycleCommand(n - 1, 1)).toBe(0);
    expect(cycleCommand(0, -1)).toBe(n - 1);
  });
});
