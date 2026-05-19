// @yume-format: 1
/**
 * BIBLE.js - The Executable Specification for Student Athlete Scout SNS
 * @tags: bible, spec, rules
 */

export const __block = {
  id: 'sns:bible',
  type: 'aiDoc',
  versions: [
    {
      hash: 'initial',
      content: '', // Head content will be below
      ts: Date.now(),
      refs: [],
      tags: ['bible']
    }
  ]
};

// === HEAD ===

export const Roles = {
  STUDENT: 'role:student',
  CORPORATION: 'role:corp',
  ADMIN: 'role:admin'
};

export const MatchStatus = {
  IDLE: 'status:idle',
  SCOUTED: 'status:scouted',
  INTERVIEW_SET: 'status:interview_set',
  HIRED: 'status:hired',
  REJECTED: 'status:rejected'
};

export const InterviewType = {
  SINGLE: 'type:single',
  PAIR: 'type:pair'
};

/**
 * Charging Rules (Monetization)
 */
export const Fees = {
  SINGLE_INTERVIEW: 'jpy:10000',
  PAIR_INTERVIEW:   'jpy:15000', // Discounted compared to 2x single
  SINGLE_HIRE:      'jpy:200000',
  PAIR_HIRE:        'jpy:350000' // Discounted
};

/**
 * Constraint: Transition Guard
 * Defines valid status transitions.
 */
export const StatusTransitions = {
  axes: ['from', 'to'],
  values: {
    from: Object.values(MatchStatus),
    to:   Object.values(MatchStatus)
  },
  derive: combo => {
    const valid = (
      (combo.from === MatchStatus.IDLE && combo.to === MatchStatus.SCOUTED) ||
      (combo.from === MatchStatus.SCOUTED && combo.to === MatchStatus.INTERVIEW_SET) ||
      (combo.from === MatchStatus.INTERVIEW_SET && combo.to === MatchStatus.HIRED) ||
      (combo.from === MatchStatus.SCOUTED && combo.to === MatchStatus.REJECTED) ||
      (combo.from === MatchStatus.INTERVIEW_SET && combo.to === MatchStatus.REJECTED)
    );
    return { _isValid: valid };
  }
};

/**
 * Rule: Pair Scouting Eligibility
 * Two students can be pair-scouted ONLY if they have a mutual BEST_FRIEND link.
 */
export function checkPairEligibility(userA, userB) {
  const aPrefersB = userA.profile.friends.includes(userB.id);
  const bPrefersA = userB.profile.friends.includes(userA.id);
  return aPrefersB && bPrefersA;
}

// === /HEAD ===
