// @yume-format: 1
/**
 * logic.yume.js - Core Business Logic & State Management
 * @tags: logic, state, reducer
 */

import { EventStore, evalConstraint } from './yume-core.js';
import { Roles, MatchStatus, StatusTransitions, checkPairEligibility, Fees } from './BIBLE.js';

export const __block = {
  id: 'sns:logic',
  type: 'module',
  versions: [{ hash: 'initial', content: '', ts: Date.now(), refs: [], tags: ['logic'] }]
};

// === HEAD ===

const initialState = {
  users: {}, // { id: { id, role, profile: { name, sport, friends: [] } } }
  matches: {}, // { id: { id, corpId, studentIds: [], status, interviewType, createdAt } }
  billing: [], // { id, matchId, amount, type, timestamp }
  REAL_auth: null // { publicId, identity }
};

/**
 * REDUCER: Purely derives next state from current state + event
 */
export function snsReducer(state, event) {
  const { type, payload } = event;
  const users = { ...state.users };
  const matches = { ...state.matches };
  const billing = [...state.billing];

  switch (type) {
    case 'USER_REGISTER': {
      users[payload.id] = {
        id: payload.id,
        role: payload.role,
        profile: { 
          name: payload.name, 
          sport: payload.sport || '',
          position: payload.position || '',
          achievements: payload.achievements || '',
          selfPR: payload.selfPR || '',
          friends: [] 
        }
      };
      break;
    }

    case 'UPDATE_PROFILE': {
      const user = users[payload.userId];
      if (user) {
        users[payload.userId] = {
          ...user,
          profile: {
            ...user.profile,
            ...payload.profile
          }
        };
      }
      break;
    }

    case 'SET_FRIEND': {
      const student = users[payload.studentId];
      if (student) {
        users[payload.studentId] = {
          ...student,
          profile: {
            ...student.profile,
            friends: [...new Set([...student.profile.friends, payload.friendId])]
          }
        };
      }
      break;
    }

    case 'SEND_SCOUT': {
      const matchId = `match:${payload.corpId}:${[...payload.studentIds].sort().join('-')}`;
      matches[matchId] = {
        id: matchId,
        corpId: payload.corpId,
        studentIds: payload.studentIds,
        status: MatchStatus.SCOUTED,
        interviewType: payload.studentIds.length > 1 ? 'タイプ:ペア' : 'タイプ:単体',
        createdAt: Date.now()
      };
      break;
    }

    case 'REJECT_SCOUT': {
      const match = matches[payload.matchId];
      if (match) {
        match.status = MatchStatus.REJECTED;
      }
      break;
    }

    case 'SET_INTERVIEW': {
      const match = matches[payload.matchId];
      if (match) {
        match.status = MatchStatus.INTERVIEW_SET;
        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_INTERVIEW : Fees.SINGLE_INTERVIEW;
        billing.push({
          id: `bill:${Date.now()}`,
          matchId: match.id,
          amount: fee,
          type: '手数料:面談'
        });
      }
      break;
    }

    case 'MARK_HIRED': {
      const match = matches[payload.matchId];
      if (match) {
        match.status = MatchStatus.HIRED;
        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_HIRE : Fees.SINGLE_HIRE;
        billing.push({
          id: `bill:${Date.now()}`,
          matchId: match.id,
          amount: fee,
          type: '手数料:採用'
        });
      }
      break;
    }

    case 'SET_AUTH': {
      return { ...state, REAL_auth: payload };
    }
  }

  return { users, matches, billing };
}

/**
 * VALIDATOR: Checks if an event is allowed given the current state
 */
export function snsValidator(state, event) {
  const { type, payload } = event;

  if (!payload) return false;

  if (type === 'USER_REGISTER') {
    if (!payload.id || !payload.role || !payload.name) return false;
  }

  if (type === 'SET_FRIEND') {
    if (!payload.studentId || !payload.friendId) return false;
    const s1 = state.users[payload.studentId];
    const s2 = state.users[payload.friendId];
    if (!s1 || !s2 || s1.role !== Roles.STUDENT || s2.role !== Roles.STUDENT) return false;
  }

  if (type === 'SET_AUTH') {
    if (!payload.publicId || !payload.identity) return false;
  }

  if (type === 'SEND_SCOUT') {
    // If pair scout, check eligibility
    if (payload.studentIds.length === 2) {
      const s1 = state.users[payload.studentIds[0]];
      const s2 = state.users[payload.studentIds[1]];
      if (!s1 || !s2 || !checkPairEligibility(s1, s2)) return false;
    } else if (payload.studentIds.length === 1) {
      const s = state.users[payload.studentIds[0]];
      if (!s || s.role !== Roles.STUDENT) return false;
    } else {
      return false;
    }
    const c = state.users[payload.corpId];
    if (!c || c.role !== Roles.CORPORATION) return false;
  }

  if (type === 'REJECT_SCOUT') {
    const match = state.matches[payload.matchId];
    if (!match) return false;
    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: MatchStatus.REJECTED });
    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;
  }

  if (type === 'SET_INTERVIEW' || type === 'MARK_HIRED') {
    const match = state.matches[payload.matchId];
    if (!match) return false;
    
    // Use BIBLE constraints for status transition
    const targetStatus = type === 'SET_INTERVIEW' ? MatchStatus.INTERVIEW_SET : MatchStatus.HIRED;
    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: targetStatus });
    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;
  }

  return true;
}

export const store = new EventStore(initialState);

export function dispatch(event) {
  return store.dispatch(event, snsReducer, snsValidator);
}

// === /HEAD ===
