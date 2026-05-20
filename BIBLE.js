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
  STUDENT: 'ロール:学生',
  CORPORATION: 'ロール:企業',
  ADMIN: 'ロール:管理者'
};

export const MatchStatus = {
  IDLE: '状態:未接触',
  SCOUTED: '状態:スカウト済み',
  INTERVIEW_SET: '状態:面談設定済み',
  HIRED: '状態:採用確定',
  REJECTED: '状態:辞退・お見送り'
};

export const InterviewType = {
  SINGLE: 'タイプ:単体',
  PAIR: 'タイプ:ペア'
};

/**
 * 課金ルール (収益ポイント)
 */
export const Fees = {
  SINGLE_INTERVIEW: 'jpy:10000',
  PAIR_INTERVIEW:   'jpy:15000', // 2人分を単体で受けるよりお得
  SINGLE_HIRE:      'jpy:200000',
  PAIR_HIRE:        'jpy:350000' // 2人セットでの採用ボーナス
};

/**
 * 学生プロフィールの詳細定義
 */
export const StudentProfileSpec = {
  fields: {
    name: '氏名',
    sport: '競技種目',
    position: 'ポジション・役割',
    achievements: '競技実績（大会結果など）',
    selfPR: '自己PR',
    bestFriendId: '親友ID（ペアスカウト用）'
  }
};

/**
 * 学生側の体験フロー
 * 1. QR鍵でログイン
 * 2. プロフィール（競技実績、自己PR）を入力
 * 3. 仲の良い友人と「親友リンク」を締結
 * 4. 企業からの「単体スカウト」または「ペアスカウト」を受信
 * 5. 面談の承諾・辞退を選択
 */
export const StudentExperience = [
  'LOGIN_QR',
  'EDIT_PROFILE',
  'LINK_FRIEND',
  'RECEIVE_SCOUT',
  'RESPOND_INTERVIEW'
];

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
