import { describe, expect, it } from 'vitest';
import { runCommand, chips } from '../src/lib/commands';

describe('terminal commands', () => {
  it('ignores empty input', () => {
    expect(runCommand('   ')).toBeNull();
  });
  it('is case-insensitive and trims', () => {
    expect(runCommand('  WHOAMI ')?.output).toContain('Asifur');
  });
  it('reports unknown commands', () => {
    expect(runCommand('rm -rf /')?.output).toMatch(/command not found/);
  });
  it('returns side effects as actions instead of running them', () => {
    expect(runCommand('github')?.action).toEqual({ type: 'open', url: 'https://github.com/asifur-rahman9' });
    expect(runCommand('game')?.action).toEqual({ type: 'scroll', id: 'break' });
    expect(runCommand('clear')?.action).toEqual({ type: 'clear' });
  });
  it('prints history', () => {
    expect(runCommand('history', ['whoami', 'skills'])?.output).toBe('whoami\nskills');
  });
  it('every suggested chip is a real command', () => {
    for (const c of chips) expect(runCommand(c)?.output).not.toMatch(/command not found/);
  });
});
