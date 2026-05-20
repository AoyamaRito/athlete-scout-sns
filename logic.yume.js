// @yume-format: 1

export const __block = {
  "id": "sns:logic",
  "type": "module",
  "schemaVersion": 2,
  "runtime": {
    "name": "yume",
    "version": "002"
  },
  "versions": [
    {
      "v": 1,
      "content": "",
      "ts": 1778951598747,
      "refs": [
        {
          "kind": "import",
          "target": "./yume-core.js"
        },
        {
          "kind": "import",
          "target": "./BIBLE.js"
        }
      ],
      "tags": [
        "logic"
      ],
      "applyId": null
    },
    {
      "content": "\nconst initialState = {\n  users: {\n    'std:alice': {\n      id: 'std:alice',\n      role: Roles.STUDENT,\n      profile: {\n        name: '清水 美咲',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将',\n        achievements: '全国高校選手権ベスト8、都リーグ得点王',\n        selfPR: 'チームを牽引するリーダーシップと、決定機を逃さない決定力が強みです。親友の木村とは中高大10年間同じピッチで戦い、阿吽の呼吸でパスを通せます。',\n        friends: ['std:bob']\n      }\n    },\n    'std:bob': {\n      id: 'std:bob',\n      role: Roles.STUDENT,\n      profile: {\n        name: '木村 拓海',\n        sport: 'サッカー部 (MF)',\n        position: 'ミッドフィルダー / 司令塔',\n        achievements: '関東大学2部リーグ アシスト王',\n        selfPR: '広い視野から繰り出す正確なパスと、ゲームを支配する戦術眼が武器です。清水とは長年お互いの視線だけでゴールを演出できる関係です。',\n        friends: ['std:alice']\n      }\n    },\n    'std:charlie': {\n      id: 'std:charlie',\n      role: Roles.STUDENT,\n      profile: {\n        name: '佐藤 大翔',\n        sport: '野球部 (投手)',\n        position: 'エースピッチャー',\n        achievements: '東京六大学リーグ 最優秀防御率',\n        selfPR: '最速148kmのストレートとキレのあるスライダーが武器です。チームの勝利のために、マウンド上では常に冷静さを失いません。',\n        friends: []\n      }\n    },\n    'std:dave': {\n      id: 'std:dave',\n      role: Roles.STUDENT,\n      profile: {\n        name: '鈴木 翔太',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        achievements: '春季リーグ ベストナイン',\n        selfPR: '投手の長所を引き出すインサイドワークと二塁送球1.9秒の強肩が売りです。佐藤とはバッテリーとして絶対の信頼関係があります。',\n        friends: ['std:charlie']\n      }\n    },\n    'corp:demo': {\n      id: 'corp:demo',\n      role: Roles.CORPORATION,\n      profile: {\n        name: '株式会社スポーツリーディング',\n        sport: 'スポーツ採用・マーケティング'\n      }\n    }\n  },\n  matches: {\n    'match:corp:demo:std:alice-std:bob': {\n      id: 'match:corp:demo:std:alice-std:bob',\n      corpId: 'corp:demo',\n      studentIds: ['std:alice', 'std:bob'],\n      status: MatchStatus.SCOUTED,\n      interviewType: 'タイプ:ペア',\n      createdAt: Date.now()\n    }\n  },\n  billing: [],\n  REAL_auth: null\n};\n\n/**\n * REDUCER: Purely derives next state from current state + event\n */\nexport function snsReducer(state, event) {\n  const { type, payload } = event;\n  const users = { ...state.users };\n  const matches = { ...state.matches };\n  const billing = [...state.billing];\n\n  switch (type) {\n    case 'USER_REGISTER': {\n      users[payload.id] = {\n        id: payload.id,\n        role: payload.role,\n        profile: { \n          name: payload.name, \n          sport: payload.sport || '',\n          position: payload.position || '',\n          achievements: payload.achievements || '',\n          selfPR: payload.selfPR || '',\n          friends: [] \n        }\n      };\n      break;\n    }\n\n    case 'UPDATE_PROFILE': {\n      const user = users[payload.userId];\n      if (user) {\n        users[payload.userId] = {\n          ...user,\n          profile: {\n            ...user.profile,\n            ...payload.profile\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SET_FRIEND': {\n      const student = users[payload.studentId];\n      if (student) {\n        users[payload.studentId] = {\n          ...student,\n          profile: {\n            ...student.profile,\n            friends: [...new Set([...student.profile.friends, payload.friendId])]\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SEND_SCOUT': {\n      const matchId = `match:${payload.corpId}:${[...payload.studentIds].sort().join('-')}`;\n      matches[matchId] = {\n        id: matchId,\n        corpId: payload.corpId,\n        studentIds: payload.studentIds,\n        status: MatchStatus.SCOUTED,\n        interviewType: payload.studentIds.length > 1 ? 'タイプ:ペア' : 'タイプ:単体',\n        createdAt: Date.now()\n      };\n      break;\n    }\n\n    case 'REJECT_SCOUT': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.REJECTED;\n      }\n      break;\n    }\n\n    case 'CANCEL_SCOUT': {\n      // Cleanly delete the pending match since no fees are incurred yet\n      if (matches[payload.matchId]) {\n        delete matches[payload.matchId];\n      }\n      break;\n    }\n\n    case 'SET_INTERVIEW': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.INTERVIEW_SET;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_INTERVIEW : Fees.SINGLE_INTERVIEW;\n        billing.push({\n          id: `bill:${Date.now()}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:面談'\n        });\n      }\n      break;\n    }\n\n    case 'MARK_HIRED': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.HIRED;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_HIRE : Fees.SINGLE_HIRE;\n        billing.push({\n          id: `bill:${Date.now()}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:採用'\n        });\n      }\n      break;\n    }\n\n    case 'SET_AUTH': {\n      return { ...state, REAL_auth: payload };\n    }\n  }\n\n  return { users, matches, billing };\n}\n\n/**\n * VALIDATOR: Checks if an event is allowed given the current state\n */\nexport function snsValidator(state, event) {\n  const { type, payload } = event;\n\n  if (!payload) return false;\n\n  if (type === 'USER_REGISTER') {\n    if (!payload.id || !payload.role || !payload.name) return false;\n  }\n\n  if (type === 'SET_FRIEND') {\n    if (!payload.studentId || !payload.friendId) return false;\n    const s1 = state.users[payload.studentId];\n    const s2 = state.users[payload.friendId];\n    if (!s1 || !s2 || s1.role !== Roles.STUDENT || s2.role !== Roles.STUDENT) return false;\n  }\n\n  if (type === 'SET_AUTH') {\n    if (!payload.publicId || !payload.identity) return false;\n  }\n\n  if (type === 'SEND_SCOUT') {\n    // If pair scout, check eligibility\n    if (payload.studentIds.length === 2) {\n      const s1 = state.users[payload.studentIds[0]];\n      const s2 = state.users[payload.studentIds[1]];\n      if (!s1 || !s2 || !checkPairEligibility(s1, s2)) return false;\n    } else if (payload.studentIds.length === 1) {\n      const s = state.users[payload.studentIds[0]];\n      if (!s || s.role !== Roles.STUDENT) return false;\n    } else {\n      return false;\n    }\n    const c = state.users[payload.corpId];\n    if (!c || c.role !== Roles.CORPORATION) return false;\n  }\n\n  if (type === 'REJECT_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: MatchStatus.REJECTED });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  if (type === 'CANCEL_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match || match.status !== MatchStatus.SCOUTED) return false;\n  }\n\n  if (type === 'SET_INTERVIEW' || type === 'MARK_HIRED') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    \n    // Use BIBLE constraints for status transition\n    const targetStatus = type === 'SET_INTERVIEW' ? MatchStatus.INTERVIEW_SET : MatchStatus.HIRED;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: targetStatus });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  return true;\n}\n\nexport const store = new EventStore(initialState);\n\nexport function dispatch(event) {\n  return store.dispatch(event, snsReducer, snsValidator);\n}\n",
      "ts": 1779249709410,
      "refs": [
        {
          "kind": "calls",
          "target": "Set"
        },
        {
          "kind": "calls",
          "target": "checkPairEligibility"
        },
        {
          "kind": "calls",
          "target": "evalConstraint"
        },
        {
          "kind": "calls",
          "target": "EventStore"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-3adfe91f",
      "v": 2
    }
  ],
  "notes": {
    "apply:apply-2026-05-20-3adfe91f": [
      {
        "id": "n-9d7781a7-ec11-4710-915d-4dda24d50564",
        "author": "human",
        "ts": 1779249709414,
        "text": "Initial bootstrap"
      }
    ]
  }
};

// === HEAD ===

const initialState = {
  users: {
    'std:alice': {
      id: 'std:alice',
      role: Roles.STUDENT,
      profile: {
        name: '清水 美咲',
        sport: 'サッカー部 (FW)',
        position: 'フォワード / 主将',
        achievements: '全国高校選手権ベスト8、都リーグ得点王',
        selfPR: 'チームを牽引するリーダーシップと、決定機を逃さない決定力が強みです。親友の木村とは中高大10年間同じピッチで戦い、阿吽の呼吸でパスを通せます。',
        friends: ['std:bob']
      }
    },
    'std:bob': {
      id: 'std:bob',
      role: Roles.STUDENT,
      profile: {
        name: '木村 拓海',
        sport: 'サッカー部 (MF)',
        position: 'ミッドフィルダー / 司令塔',
        achievements: '関東大学2部リーグ アシスト王',
        selfPR: '広い視野から繰り出す正確なパスと、ゲームを支配する戦術眼が武器です。清水とは長年お互いの視線だけでゴールを演出できる関係です。',
        friends: ['std:alice']
      }
    },
    'std:charlie': {
      id: 'std:charlie',
      role: Roles.STUDENT,
      profile: {
        name: '佐藤 大翔',
        sport: '野球部 (投手)',
        position: 'エースピッチャー',
        achievements: '東京六大学リーグ 最優秀防御率',
        selfPR: '最速148kmのストレートとキレのあるスライダーが武器です。チームの勝利のために、マウンド上では常に冷静さを失いません。',
        friends: []
      }
    },
    'std:dave': {
      id: 'std:dave',
      role: Roles.STUDENT,
      profile: {
        name: '鈴木 翔太',
        sport: '野球部 (捕手)',
        position: '正捕手 / 副主将',
        achievements: '春季リーグ ベストナイン',
        selfPR: '投手の長所を引き出すインサイドワークと二塁送球1.9秒の強肩が売りです。佐藤とはバッテリーとして絶対の信頼関係があります。',
        friends: ['std:charlie']
      }
    },
    'corp:demo': {
      id: 'corp:demo',
      role: Roles.CORPORATION,
      profile: {
        name: '株式会社スポーツリーディング',
        sport: 'スポーツ採用・マーケティング'
      }
    }
  },
  matches: {
    'match:corp:demo:std:alice-std:bob': {
      id: 'match:corp:demo:std:alice-std:bob',
      corpId: 'corp:demo',
      studentIds: ['std:alice', 'std:bob'],
      status: MatchStatus.SCOUTED,
      interviewType: 'タイプ:ペア',
      createdAt: Date.now()
    }
  },
  billing: [],
  REAL_auth: null
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

    case 'CANCEL_SCOUT': {
      // Cleanly delete the pending match since no fees are incurred yet
      if (matches[payload.matchId]) {
        delete matches[payload.matchId];
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

  if (type === 'CANCEL_SCOUT') {
    const match = state.matches[payload.matchId];
    if (!match || match.status !== MatchStatus.SCOUTED) return false;
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
