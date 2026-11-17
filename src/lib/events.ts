// Window events the terminal uses to talk to the other islands (hero scene, projects).
export const EVENTS = { petDuck: 'pet-duck', sipCoffee: 'sip-coffee', selectProject: 'select-project' } as const;
type EventName = (typeof EVENTS)[keyof typeof EVENTS];

declare global {
  // set by the terminal in case the Projects island hasn't hydrated when `open <name>` runs
  interface Window { __pendingProject?: string }
}

export function emit(name: EventName, detail?: string) {
  if (name === EVENTS.selectProject) window.__pendingProject = detail;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Subscribe to an event; returns the unsubscribe function (handy as a useEffect cleanup). */
export function listen(name: EventName, fn: (detail?: string) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<string | undefined>).detail);
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
