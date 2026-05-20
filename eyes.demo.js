// @yume-format: 1
/**
 * eyes.demo.js - Demo for AI-Eyes verification
 * @tags: demo, eyes
 */

import { snsReducer, snsValidator } from './logic.yume.js';
import { Roles, MatchStatus } from './BIBLE.js';

export function initialState() {
  return {
    users: {},
    matches: {},
    billing: [],
    REAL_auth: null
  };
}

export function dispatch(state, evt) {
  if (snsValidator(state, evt)) {
    return snsReducer(state, evt);
  }
  return state;
}

export function render(ctx, state, dims) {
  const { w, h } = dims;
  
  // Background
  ctx.fillStyle = '#f0f2f5';
  ctx.fillRect(0, 0, w, h);

  // Header
  ctx.fillStyle = '#1877f2';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Athlete Scout SNS - Eyes Verification', 20, 50);

  // Users
  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`Users: ${Object.keys(state.users).length}`, 20, 90);
  
  let y = 120;
  Object.values(state.users).forEach(u => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, y, w - 40, 30);
    ctx.fillStyle = '#000';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${u.id}: ${u.profile.name} (${u.role}) - ${u.profile.sport}`, 30, y + 20);
    y += 40;
  });

  // Matches
  y += 20;
  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`Matches: ${Object.keys(state.matches).length}`, 20, y);
  y += 30;
  Object.values(state.matches).forEach(m => {
    ctx.fillStyle = '#e7f3ff';
    ctx.fillRect(20, y, w - 40, 30);
    ctx.fillStyle = '#1877f2';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${m.id} [${m.status}]`, 30, y + 20);
    y += 40;
  });

  // Billing
  y += 20;
  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`Billing Records: ${state.billing.length}`, 20, y);
  y += 30;
  state.billing.forEach(b => {
    ctx.fillStyle = '#fff0f0';
    ctx.fillRect(20, y, w - 40, 30);
    ctx.fillStyle = '#d0021b';
    ctx.font = '14px monospace';
    ctx.fillText(`${b.type}: ${b.amount} for ${b.matchId}`, 30, y + 20);
    y += 40;
  });
}

export const events = [
  { label: 'Register Alice', evt: { type: 'USER_REGISTER', payload: { id: 'std:alice', role: Roles.STUDENT, name: 'Alice', sport: 'Soccer' } } },
  { label: 'Register Bob', evt: { type: 'USER_REGISTER', payload: { id: 'std:bob', role: Roles.STUDENT, name: 'Bob', sport: 'Soccer' } } },
  { label: 'Set Friends', evt: [
    { type: 'SET_FRIEND', payload: { studentId: 'std:alice', friendId: 'std:bob' } },
    { type: 'SET_FRIEND', payload: { studentId: 'std:bob', friendId: 'std:alice' } }
  ] },
  { label: 'Register MegaCorp', evt: { type: 'USER_REGISTER', payload: { id: 'corp:mega', role: Roles.CORPORATION, name: 'MegaCorp' } } },
  { label: 'Pair Scout', evt: { type: 'SEND_SCOUT', payload: { corpId: 'corp:mega', studentIds: ['std:alice', 'std:bob'] } } },
  { label: 'Set Interview', evt: { type: 'SET_INTERVIEW', payload: { matchId: 'match:corp:mega:std:alice-std:bob' } } },
  { label: 'Mark Hired', evt: { type: 'MARK_HIRED', payload: { matchId: 'match:corp:mega:std:alice-std:bob' } } }
];

export default { initialState, dispatch, render, events };
