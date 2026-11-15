import { describe, expect, it } from 'vitest';
import { runCommand, helpCommands, formatGitLog, commandNames } from '../src/lib/commands';
import { experience } from '../src/data/site';

describe('terminal commands', () => {
  it('ignores empty input', () => expect(runCommand('   ')).toBeNull());
  it('is case-insensitive and collapses spaces', () => {
    expect(runCommand('  WHOAMI ')?.output).toContain('Asif');
    expect(runCommand('git   log')?.action).toEqual({ type: 'gitlog' });
  });
  it('reports unknown commands', () => expect(runCommand('make coffee')?.output).toMatch(/command not found/));
  it('every command listed in help works', () => {
    for (const c of helpCommands) expect(runCommand(c)?.output).not.toMatch(/command not found/);
  });
  it('prints every resume bullet in experience', () => {
    const out = runCommand('experience')!.output;
    for (const j of experience) for (const b of j.bullets) expect(out).toContain(b);
  });
  it('opens projects by short name', () => {
    expect(runCommand('open hammerfall')?.action).toEqual({ type: 'project', id: 'engine' });
    expect(runCommand('open nope')?.output).toMatch(/no project/);
  });
  it('returns side effects as actions', () => {
    expect(runCommand('github')?.action).toEqual({ type: 'open', url: 'https://github.com/asifur-rahman9' });
    expect(runCommand('clear')?.action).toEqual({ type: 'clear' });
    expect(runCommand('coffee')?.action).toEqual({ type: 'sip' });
  });
  it('numbers history', () => expect(runCommand('history', ['help', 'skills'])?.output).toBe('  1  help\n  2  skills'));
  it('completes hidden commands too', () => expect(commandNames()).toContain('coffee'));
  it('formats git log rows', () => {
    expect(formatGitLog([{ repo: 'a', sha: '1234567', message: 'm', when: '1 day ago' }])).toBe('1234567  a  m  (1 day ago)');
    expect(formatGitLog([])).toMatch(/could not reach/);
  });
});
