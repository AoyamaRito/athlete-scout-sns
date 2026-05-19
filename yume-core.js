// @yume-format: 1
// yume-core.js - Minimal AI-Native Core for Student Scout SNS

export function hash(obj) {
  const stable = JSON.stringify(obj, Object.keys(obj).sort());
  let h = 0x811c9dc5;
  for (let i = 0; i < stable.length; i++) {
    h ^= stable.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function evalConstraint({ axes, values, derive }, filter = {}) {
  function* gen(idx, current) {
    if (idx === axes.length) { yield current; return; }
    const axis = axes[idx]; 
    for (const v of values[axis]) yield* gen(idx + 1, { ...current, [axis]: v });
  }
  const worlds = [];
  for (const w of gen(0, {})) {
    const derived = derive(w) || {}, merged = { ...w, ...derived };
    let pass = true; 
    for (const [k, v] of Object.entries(filter)) {
      if (!k.startsWith('_') && merged[k] !== v) { pass = false; break; }
    }
    if (pass) worlds.push(merged);
  }
  return worlds.length === 0 ? { _contradiction: true } : { _worlds: worlds.length, worlds };
}

export class EventStore {
  constructor(initialState = {}) {
    this.REAL_state = initialState;
    this.events = [];
  }
  dispatch(event, reducer, validator) {
    if (validator && !validator(this.REAL_state, event)) {
      console.error('Validation failed for event:', event);
      return false;
    }
    const nextState = reducer(this.REAL_state, event);
    event.timestamp = Date.now();
    event.prevHash = this.events.length > 0 ? this.events[this.events.length - 1].hash : null;
    event.hash = hash(event);
    this.events.push(event);
    this.REAL_state = nextState;
    return true;
  }
}
