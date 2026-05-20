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
    },
    {
      "content": "\nimport { EventStore, evalConstraint } from './yume-core.js';\nimport { Roles, MatchStatus, StatusTransitions, checkPairEligibility, Fees } from './BIBLE.js';\n\nconst initialState = {\n  users: {\n    'std:alice': {\n      id: 'std:alice',\n      role: Roles.STUDENT,\n      profile: {\n        name: '清水 美咲',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将',\n        achievements: '全国高校選手権ベスト8、都リーグ得点王',\n        selfPR: 'チームを牽引するリーダーシップと、決定機を逃さない決定力が強みです。親友の木村とは中高大10年間同じピッチで戦い、阿吽の呼吸でパスを通せます。',\n        friends: ['std:bob']\n      }\n    },\n    'std:bob': {\n      id: 'std:bob',\n      role: Roles.STUDENT,\n      profile: {\n        name: '木村 拓海',\n        sport: 'サッカー部 (MF)',\n        position: 'ミッドフィルダー / 司令塔',\n        achievements: '関東大学2部リーグ アシスト王',\n        selfPR: '広い視野から繰り出す正確なパスと、ゲームを支配する戦術眼が武器です。清水とは長年お互いの視線だけでゴールを演出できる関係です。',\n        friends: ['std:alice']\n      }\n    },\n    'std:charlie': {\n      id: 'std:charlie',\n      role: Roles.STUDENT,\n      profile: {\n        name: '佐藤 大翔',\n        sport: '野球部 (投手)',\n        position: 'エースピッチャー',\n        achievements: '東京六大学リーグ 最優秀防御率',\n        selfPR: '最速148kmのストレートとキレのあるスライダーが武器です。チームの勝利のために、マウンド上では常に冷静さを失いません。',\n        friends: []\n      }\n    },\n    'std:dave': {\n      id: 'std:dave',\n      role: Roles.STUDENT,\n      profile: {\n        name: '鈴木 翔太',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        achievements: '春季リーグ ベストナイン',\n        selfPR: '投手の長所を引き出すインサイドワークと二塁送球1.9秒の強肩が売りです。佐藤とはバッテリーとして絶対の信頼関係があります。',\n        friends: ['std:charlie']\n      }\n    },\n    'corp:demo': {\n      id: 'corp:demo',\n      role: Roles.CORPORATION,\n      profile: {\n        name: '株式会社スポーツリーディング',\n        sport: 'スポーツ採用・マーケティング'\n      }\n    }\n  },\n  matches: {\n    'match:corp:demo:std:alice-std:bob': {\n      id: 'match:corp:demo:std:alice-std:bob',\n      corpId: 'corp:demo',\n      studentIds: ['std:alice', 'std:bob'],\n      status: MatchStatus.SCOUTED,\n      interviewType: 'タイプ:ペア',\n      createdAt: Date.now()\n    }\n  },\n  billing: [],\n  REAL_auth: null\n};\n\n/**\n * REDUCER: Purely derives next state from current state + event\n */\nexport function snsReducer(state, event) {\n  const { type, payload } = event;\n  const users = { ...state.users };\n  const matches = { ...state.matches };\n  const billing = [...state.billing];\n\n  switch (type) {\n    case 'USER_REGISTER': {\n      users[payload.id] = {\n        id: payload.id,\n        role: payload.role,\n        profile: { \n          name: payload.name, \n          sport: payload.sport || '',\n          position: payload.position || '',\n          achievements: payload.achievements || '',\n          selfPR: payload.selfPR || '',\n          friends: [] \n        }\n      };\n      break;\n    }\n\n    case 'UPDATE_PROFILE': {\n      const user = users[payload.userId];\n      if (user) {\n        users[payload.userId] = {\n          ...user,\n          profile: {\n            ...user.profile,\n            ...payload.profile\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SET_FRIEND': {\n      const student = users[payload.studentId];\n      if (student) {\n        users[payload.studentId] = {\n          ...student,\n          profile: {\n            ...student.profile,\n            friends: [...new Set([...student.profile.friends, payload.friendId])]\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SEND_SCOUT': {\n      const matchId = `match:${payload.corpId}:${[...payload.studentIds].sort().join('-')}`;\n      matches[matchId] = {\n        id: matchId,\n        corpId: payload.corpId,\n        studentIds: payload.studentIds,\n        status: MatchStatus.SCOUTED,\n        interviewType: payload.studentIds.length > 1 ? 'タイプ:ペア' : 'タイプ:単体',\n        createdAt: Date.now()\n      };\n      break;\n    }\n\n    case 'REJECT_SCOUT': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.REJECTED;\n      }\n      break;\n    }\n\n    case 'CANCEL_SCOUT': {\n      // Cleanly delete the pending match since no fees are incurred yet\n      if (matches[payload.matchId]) {\n        delete matches[payload.matchId];\n      }\n      break;\n    }\n\n    case 'SET_INTERVIEW': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.INTERVIEW_SET;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_INTERVIEW : Fees.SINGLE_INTERVIEW;\n        billing.push({\n          id: `bill:${Date.now()}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:面談'\n        });\n      }\n      break;\n    }\n\n    case 'MARK_HIRED': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.HIRED;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_HIRE : Fees.SINGLE_HIRE;\n        billing.push({\n          id: `bill:${Date.now()}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:採用'\n        });\n      }\n      break;\n    }\n\n    case 'SET_AUTH': {\n      return { ...state, REAL_auth: payload };\n    }\n  }\n\n  return { users, matches, billing };\n}\n\n/**\n * VALIDATOR: Checks if an event is allowed given the current state\n */\nexport function snsValidator(state, event) {\n  const { type, payload } = event;\n\n  if (!payload) return false;\n\n  if (type === 'USER_REGISTER') {\n    if (!payload.id || !payload.role || !payload.name) return false;\n  }\n\n  if (type === 'SET_FRIEND') {\n    if (!payload.studentId || !payload.friendId) return false;\n    const s1 = state.users[payload.studentId];\n    const s2 = state.users[payload.friendId];\n    if (!s1 || !s2 || s1.role !== Roles.STUDENT || s2.role !== Roles.STUDENT) return false;\n  }\n\n  if (type === 'SET_AUTH') {\n    if (!payload.publicId || !payload.identity) return false;\n  }\n\n  if (type === 'SEND_SCOUT') {\n    // If pair scout, check eligibility\n    if (payload.studentIds.length === 2) {\n      const s1 = state.users[payload.studentIds[0]];\n      const s2 = state.users[payload.studentIds[1]];\n      if (!s1 || !s2 || !checkPairEligibility(s1, s2)) return false;\n    } else if (payload.studentIds.length === 1) {\n      const s = state.users[payload.studentIds[0]];\n      if (!s || s.role !== Roles.STUDENT) return false;\n    } else {\n      return false;\n    }\n    const c = state.users[payload.corpId];\n    if (!c || c.role !== Roles.CORPORATION) return false;\n  }\n\n  if (type === 'REJECT_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: MatchStatus.REJECTED });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  if (type === 'CANCEL_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match || match.status !== MatchStatus.SCOUTED) return false;\n  }\n\n  if (type === 'SET_INTERVIEW' || type === 'MARK_HIRED') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    \n    // Use BIBLE constraints for status transition\n    const targetStatus = type === 'SET_INTERVIEW' ? MatchStatus.INTERVIEW_SET : MatchStatus.HIRED;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: targetStatus });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  return true;\n}\n\nexport const store = new EventStore(initialState);\n\nexport function dispatch(event) {\n  return store.dispatch(event, snsReducer, snsValidator);\n}\n",
      "ts": 1779252136023,
      "refs": [
        {
          "kind": "import",
          "target": "./yume-core.js"
        },
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
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
      "applyId": "apply-2026-05-20-5108b409",
      "v": 3
    },
    {
      "content": "\nimport { EventStore, evalConstraint } from './yume-core.js';\nimport { Roles, MatchStatus, StatusTransitions, checkPairEligibility, Fees } from './BIBLE.js';\n\nconst initialState = {\n  users: {\n    'std:alice': {\n      id: 'std:alice',\n      role: Roles.STUDENT,\n      profile: {\n        name: '清水 美咲',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将',\n        achievements: '全国高校選手権ベスト8、都リーグ得点王',\n        selfPR: 'チームを牽引するリーダーシップと、決定機を逃さない決定力が強みです。親友の木村とは中高大10年間同じピッチで戦い、阿吽の呼吸でパスを通せます。',\n        friends: ['std:bob']\n      }\n    },\n    'std:bob': {\n      id: 'std:bob',\n      role: Roles.STUDENT,\n      profile: {\n        name: '木村 拓海',\n        sport: 'サッカー部 (MF)',\n        position: 'ミッドフィルダー / 司令塔',\n        achievements: '関東大学2部リーグ アシスト王',\n        selfPR: '広い視野から繰り出す正確なパスと、ゲームを支配する戦術眼が武器です。清水とは長年お互いの視線だけでゴールを演出できる関係です。',\n        friends: ['std:alice']\n      }\n    },\n    'std:charlie': {\n      id: 'std:charlie',\n      role: Roles.STUDENT,\n      profile: {\n        name: '佐藤 大翔',\n        sport: '野球部 (投手)',\n        position: 'エースピッチャー',\n        achievements: '東京六大学リーグ 最優秀防御率',\n        selfPR: '最速148kmのストレートとキレのあるスライダーが武器です。チームの勝利のために、マウンド上では常に冷静さを失いません。',\n        friends: []\n      }\n    },\n    'std:dave': {\n      id: 'std:dave',\n      role: Roles.STUDENT,\n      profile: {\n        name: '鈴木 翔太',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        achievements: '春季リーグ ベストナイン',\n        selfPR: '投手の長所を引き出すインサイドワークと二塁送球1.9秒の強肩が売りです。佐藤とはバッテリーとして絶対の信頼関係があります。',\n        friends: ['std:charlie']\n      }\n    },\n    'corp:demo': {\n      id: 'corp:demo',\n      role: Roles.CORPORATION,\n      profile: {\n        name: '株式会社スポーツリーディング',\n        sport: 'スポーツ採用・マーケティング'\n      }\n    }\n  },\n  matches: {\n    'match:corp:demo:std:alice-std:bob': {\n      id: 'match:corp:demo:std:alice-std:bob',\n      corpId: 'corp:demo',\n      studentIds: ['std:alice', 'std:bob'],\n      status: MatchStatus.SCOUTED,\n      interviewType: 'タイプ:ペア',\n      createdAt: Date.now()\n    }\n  },\n  billing: [],\n  messages: [],\n  REAL_auth: null\n};\n\n/**\n * REDUCER: Purely derives next state from current state + event\n */\nexport function snsReducer(state, event) {\n  const { type, payload } = event;\n  const users = { ...state.users };\n  const matches = { ...state.matches };\n  const billing = [...state.billing];\n  const messages = state.messages ? [...state.messages] : [];\n\n  switch (type) {\n    case 'USER_REGISTER': {\n      users[payload.id] = {\n        id: payload.id,\n        role: payload.role,\n        profile: { \n          name: payload.name, \n          sport: payload.sport || '',\n          position: payload.position || '',\n          achievements: payload.achievements || '',\n          selfPR: payload.selfPR || '',\n          friends: [] \n        }\n      };\n      break;\n    }\n\n    case 'UPDATE_PROFILE': {\n      const user = users[payload.userId];\n      if (user) {\n        users[payload.userId] = {\n          ...user,\n          profile: {\n            ...user.profile,\n            ...payload.profile\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SET_FRIEND': {\n      const student = users[payload.studentId];\n      if (student) {\n        users[payload.studentId] = {\n          ...student,\n          profile: {\n            ...student.profile,\n            friends: [...new Set([...student.profile.friends, payload.friendId])]\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SEND_SCOUT': {\n      const matchId = `match:${payload.corpId}:${[...payload.studentIds].sort().join('-')}`;\n      matches[matchId] = {\n        id: matchId,\n        corpId: payload.corpId,\n        studentIds: payload.studentIds,\n        status: MatchStatus.SCOUTED,\n        interviewType: payload.studentIds.length > 1 ? 'タイプ:ペア' : 'タイプ:単体',\n        createdAt: Date.now()\n      };\n      break;\n    }\n\n    case 'REJECT_SCOUT': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.REJECTED;\n      }\n      break;\n    }\n\n    case 'CANCEL_SCOUT': {\n      // Cleanly delete the pending match since no fees are incurred yet\n      if (matches[payload.matchId]) {\n        delete matches[payload.matchId];\n      }\n      break;\n    }\n\n    case 'SET_INTERVIEW': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.INTERVIEW_SET;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_INTERVIEW : Fees.SINGLE_INTERVIEW;\n        billing.push({\n          id: `bill:${Date.now()}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:面談'\n        });\n      }\n      break;\n    }\n\n    case 'MARK_HIRED': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.HIRED;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_HIRE : Fees.SINGLE_HIRE;\n        billing.push({\n          id: `bill:${Date.now()}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:採用'\n        });\n      }\n      break;\n    }\n\n    case 'SEND_MESSAGE': {\n      messages.push({\n        id: `msg:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,\n        matchId: payload.matchId,\n        senderId: payload.senderId,\n        text: payload.text,\n        timestamp: Date.now()\n      });\n      break;\n    }\n\n    case 'SET_AUTH': {\n      return { ...state, REAL_auth: payload };\n    }\n  }\n\n  return { ...state, users, matches, billing, messages };\n}\n\n/**\n * VALIDATOR: Checks if an event is allowed given the current state\n */\nexport function snsValidator(state, event) {\n  const { type, payload } = event;\n\n  if (!payload) return false;\n\n  if (type === 'USER_REGISTER') {\n    if (!payload.id || !payload.role || !payload.name) return false;\n  }\n\n  if (type === 'SEND_MESSAGE') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    // Chat allowed during interview and after hire\n    if (match.status !== MatchStatus.INTERVIEW_SET && match.status !== MatchStatus.HIRED) return false;\n    // Must be a valid sender associated with the match\n    const isValidSender = match.corpId === payload.senderId || match.studentIds.includes(payload.senderId);\n    if (!isValidSender) return false;\n    if (typeof payload.text !== 'string' || payload.text.trim() === '') return false;\n  }\n\n  if (type === 'SET_FRIEND') {\n    if (!payload.studentId || !payload.friendId) return false;\n    const s1 = state.users[payload.studentId];\n    const s2 = state.users[payload.friendId];\n    if (!s1 || !s2 || s1.role !== Roles.STUDENT || s2.role !== Roles.STUDENT) return false;\n  }\n\n  if (type === 'SET_AUTH') {\n    if (!payload.publicId || !payload.identity) return false;\n  }\n\n  if (type === 'SEND_SCOUT') {\n    // If pair scout, check eligibility\n    if (payload.studentIds.length === 2) {\n      const s1 = state.users[payload.studentIds[0]];\n      const s2 = state.users[payload.studentIds[1]];\n      if (!s1 || !s2 || !checkPairEligibility(s1, s2)) return false;\n    } else if (payload.studentIds.length === 1) {\n      const s = state.users[payload.studentIds[0]];\n      if (!s || s.role !== Roles.STUDENT) return false;\n    } else {\n      return false;\n    }\n    const c = state.users[payload.corpId];\n    if (!c || c.role !== Roles.CORPORATION) return false;\n  }\n\n  if (type === 'REJECT_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: MatchStatus.REJECTED });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  if (type === 'CANCEL_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match || match.status !== MatchStatus.SCOUTED) return false;\n  }\n\n  if (type === 'SET_INTERVIEW' || type === 'MARK_HIRED') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    \n    // Use BIBLE constraints for status transition\n    const targetStatus = type === 'SET_INTERVIEW' ? MatchStatus.INTERVIEW_SET : MatchStatus.HIRED;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: targetStatus });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  return true;\n}\n\nexport const store = new EventStore(initialState);\n\nexport function dispatch(event) {\n  return store.dispatch(event, snsReducer, snsValidator);\n}\n",
      "ts": 1779252764905,
      "refs": [
        {
          "kind": "import",
          "target": "./yume-core.js"
        },
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
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
      "applyId": "apply-2026-05-20-a095d779",
      "v": 4
    },
    {
      "content": "\nimport { EventStore, evalConstraint } from './yume-core.js';\nimport { Roles, MatchStatus, StatusTransitions, checkPairEligibility, Fees } from './BIBLE.js';\n\nconst initialState = {\n  users: {\n    'std:alice': {\n      id: 'std:alice',\n      role: Roles.STUDENT,\n      profile: {\n        name: '清水 美咲',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将',\n        achievements: '全国高校選手権ベスト8、都リーグ得点王',\n        selfPR: 'チームを牽引するリーダーシップと、決定機を逃さない決定力が強みです。親友の木村とは中高大10年間同じピッチで戦い、阿吽の呼吸でパスを通せます。',\n        friends: ['std:bob']\n      }\n    },\n    'std:bob': {\n      id: 'std:bob',\n      role: Roles.STUDENT,\n      profile: {\n        name: '木村 拓海',\n        sport: 'サッカー部 (MF)',\n        position: 'ミッドフィルダー / 司令塔',\n        achievements: '関東大学2部リーグ アシスト王',\n        selfPR: '広い視野から繰り出す正確なパスと、ゲームを支配する戦術眼が武器です。清水とは長年お互いの視線だけでゴールを演出できる関係です。',\n        friends: ['std:alice']\n      }\n    },\n    'std:charlie': {\n      id: 'std:charlie',\n      role: Roles.STUDENT,\n      profile: {\n        name: '佐藤 大翔',\n        sport: '野球部 (投手)',\n        position: 'エースピッチャー',\n        achievements: '東京六大学リーグ 最優秀防御率',\n        selfPR: '最速148kmのストレートとキレのあるスライダーが武器です。チームの勝利のために、マウンド上では常に冷静さを失いません。',\n        friends: []\n      }\n    },\n    'std:dave': {\n      id: 'std:dave',\n      role: Roles.STUDENT,\n      profile: {\n        name: '鈴木 翔太',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        achievements: '春季リーグ ベストナイン',\n        selfPR: '投手の長所を引き出すインサイドワークと二塁送球1.9秒の強肩が売りです。佐藤とはバッテリーとして絶対の信頼関係があります。',\n        friends: ['std:charlie']\n      }\n    },\n    'corp:demo': {\n      id: 'corp:demo',\n      role: Roles.CORPORATION,\n      profile: {\n        name: '株式会社スポーツリーディング',\n        sport: 'スポーツ採用・マーケティング'\n      }\n    }\n  },\n  matches: {\n    'match:corp:demo:std:alice-std:bob': {\n      id: 'match:corp:demo:std:alice-std:bob',\n      corpId: 'corp:demo',\n      studentIds: ['std:alice', 'std:bob'],\n      status: MatchStatus.SCOUTED,\n      interviewType: 'タイプ:ペア',\n      createdAt: Date.now()\n    }\n  },\n  billing: [],\n  messages: [],\n  REAL_auth: null\n};\n\n/**\n * REDUCER: Purely derives next state from current state + event\n */\nexport function snsReducer(state, event) {\n  const { type, payload } = event;\n  const users = { ...state.users };\n  const matches = { ...state.matches };\n  const billing = [...state.billing];\n  const messages = state.messages ? [...state.messages] : [];\n\n  switch (type) {\n    case 'USER_REGISTER': {\n      users[payload.id] = {\n        id: payload.id,\n        role: payload.role,\n        profile: { \n          name: payload.name, \n          sport: payload.sport || '',\n          position: payload.position || '',\n          achievements: payload.achievements || '',\n          selfPR: payload.selfPR || '',\n          friends: [] \n        }\n      };\n      break;\n    }\n\n    case 'UPDATE_PROFILE': {\n      const user = users[payload.userId];\n      if (user) {\n        users[payload.userId] = {\n          ...user,\n          profile: {\n            ...user.profile,\n            ...payload.profile\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SET_FRIEND': {\n      const student = users[payload.studentId];\n      if (student) {\n        users[payload.studentId] = {\n          ...student,\n          profile: {\n            ...student.profile,\n            friends: [...new Set([...student.profile.friends, payload.friendId])]\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SEND_SCOUT': {\n      const matchId = `match:${payload.corpId}:${[...payload.studentIds].sort().join('-')}`;\n      matches[matchId] = {\n        id: matchId,\n        corpId: payload.corpId,\n        studentIds: payload.studentIds,\n        status: MatchStatus.SCOUTED,\n        interviewType: payload.studentIds.length > 1 ? 'タイプ:ペア' : 'タイプ:単体',\n        createdAt: Date.now()\n      };\n      break;\n    }\n\n    case 'REJECT_SCOUT': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.REJECTED;\n      }\n      break;\n    }\n\n    case 'CANCEL_SCOUT': {\n      // Cleanly delete the pending match since no fees are incurred yet\n      if (matches[payload.matchId]) {\n        delete matches[payload.matchId];\n      }\n      break;\n    }\n\n    case 'SET_INTERVIEW': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.INTERVIEW_SET;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_INTERVIEW : Fees.SINGLE_INTERVIEW;\n        billing.push({\n          id: `bill:${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:面談',\n          status: 'UNPAID'\n        });\n      }\n      break;\n    }\n\n    case 'MARK_HIRED': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.HIRED;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_HIRE : Fees.SINGLE_HIRE;\n        billing.push({\n          id: `bill:${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:採用',\n          status: 'UNPAID'\n        });\n      }\n      break;\n    }\n\n    case 'PAY_BILL': {\n      const idx = billing.findIndex(b => b.id === payload.billId);\n      if (idx !== -1) {\n        billing[idx] = { ...billing[idx], status: 'PAID' };\n      }\n      break;\n    }\n\n    case 'SEND_MESSAGE': {\n      messages.push({\n        id: `msg:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,\n        matchId: payload.matchId,\n        senderId: payload.senderId,\n        text: payload.text,\n        timestamp: Date.now()\n      });\n      break;\n    }\n\n    case 'SET_AUTH': {\n      return { ...state, REAL_auth: payload };\n    }\n  }\n\n  return { ...state, users, matches, billing, messages };\n}\n\n/**\n * VALIDATOR: Checks if an event is allowed given the current state\n */\nexport function snsValidator(state, event) {\n  const { type, payload } = event;\n\n  if (!payload) return false;\n\n  if (type === 'USER_REGISTER') {\n    if (!payload.id || !payload.role || !payload.name) return false;\n  }\n\n  if (type === 'SEND_MESSAGE') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    // Chat allowed during interview and after hire\n    if (match.status !== MatchStatus.INTERVIEW_SET && match.status !== MatchStatus.HIRED) return false;\n    \n    // Constraint: Must have paid the interview fee (手数料:面談) before chatting\n    const interviewBill = state.billing.find(b => b.matchId === payload.matchId && b.type === '手数料:面談');\n    if (!interviewBill || interviewBill.status !== 'PAID') return false;\n\n    // Must be a valid sender associated with the match\n    const isValidSender = match.corpId === payload.senderId || match.studentIds.includes(payload.senderId);\n    if (!isValidSender) return false;\n    if (typeof payload.text !== 'string' || payload.text.trim() === '') return false;\n  }\n\n  if (type === 'PAY_BILL') {\n    if (!payload.billId) return false;\n    const bill = state.billing.find(b => b.id === payload.billId);\n    if (!bill) return false;\n  }\n\n  if (type === 'SET_FRIEND') {\n    if (!payload.studentId || !payload.friendId) return false;\n    const s1 = state.users[payload.studentId];\n    const s2 = state.users[payload.friendId];\n    if (!s1 || !s2 || s1.role !== Roles.STUDENT || s2.role !== Roles.STUDENT) return false;\n  }\n\n  if (type === 'SET_AUTH') {\n    if (!payload.publicId || !payload.identity) return false;\n  }\n\n  if (type === 'SEND_SCOUT') {\n    // If pair scout, check eligibility\n    if (payload.studentIds.length === 2) {\n      const s1 = state.users[payload.studentIds[0]];\n      const s2 = state.users[payload.studentIds[1]];\n      if (!s1 || !s2 || !checkPairEligibility(s1, s2)) return false;\n    } else if (payload.studentIds.length === 1) {\n      const s = state.users[payload.studentIds[0]];\n      if (!s || s.role !== Roles.STUDENT) return false;\n    } else {\n      return false;\n    }\n    const c = state.users[payload.corpId];\n    if (!c || c.role !== Roles.CORPORATION) return false;\n  }\n\n  if (type === 'REJECT_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: MatchStatus.REJECTED });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  if (type === 'CANCEL_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match || match.status !== MatchStatus.SCOUTED) return false;\n  }\n\n  if (type === 'SET_INTERVIEW' || type === 'MARK_HIRED') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    \n    // Use BIBLE constraints for status transition\n    const targetStatus = type === 'SET_INTERVIEW' ? MatchStatus.INTERVIEW_SET : MatchStatus.HIRED;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: targetStatus });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  return true;\n}\n\nexport const store = new EventStore(initialState);\n\nexport function dispatch(event) {\n  return store.dispatch(event, snsReducer, snsValidator);\n}\n",
      "ts": 1779252896282,
      "refs": [
        {
          "kind": "import",
          "target": "./yume-core.js"
        },
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
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
      "applyId": "apply-2026-05-20-bcf854c7",
      "v": 5
    },
    {
      "content": "\nimport { EventStore, evalConstraint } from './yume-core.js';\nimport { Roles, MatchStatus, StatusTransitions, checkPairEligibility, Fees } from './BIBLE.js';\n\nconst initialState = {\n  users: {\n    'std:alice': {\n      id: 'std:alice',\n      role: Roles.STUDENT,\n      profile: {\n        name: '清水 美咲',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将',\n        achievements: '全国高校選手権ベスト8、都リーグ得点王',\n        selfPR: 'チームを牽引するリーダーシップと、決定機を逃さない決定力が強みです。親友の木村とは中高大10年間同じピッチで戦い、阿吽の呼吸でパスを通せます。',\n        friends: ['std:bob']\n      }\n    },\n    'std:bob': {\n      id: 'std:bob',\n      role: Roles.STUDENT,\n      profile: {\n        name: '木村 拓海',\n        sport: 'サッカー部 (MF)',\n        position: 'ミッドフィルダー / 司令塔',\n        achievements: '関東大学2部リーグ アシスト王',\n        selfPR: '広い視野から繰り出す正確なパスと、ゲームを支配する戦術眼が武器です。清水とは長年お互いの視線だけでゴールを演出できる関係です。',\n        friends: ['std:alice']\n      }\n    },\n    'std:charlie': {\n      id: 'std:charlie',\n      role: Roles.STUDENT,\n      profile: {\n        name: '佐藤 大翔',\n        sport: '野球部 (投手)',\n        position: 'エースピッチャー',\n        achievements: '東京六大学リーグ 最優秀防御率',\n        selfPR: '最速148kmのストレートとキレのあるスライダーが武器です。チームの勝利のために、マウンド上では常に冷静さを失いません。',\n        friends: []\n      }\n    },\n    'std:dave': {\n      id: 'std:dave',\n      role: Roles.STUDENT,\n      profile: {\n        name: '鈴木 翔太',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        achievements: '春季リーグ ベストナイン',\n        selfPR: '投手の長所を引き出すインサイドワークと二塁送球1.9秒の強肩が売りです。佐藤とはバッテリーとして絶対の信頼関係があります。',\n        friends: ['std:charlie']\n      }\n    },\n    'corp:demo': {\n      id: 'corp:demo',\n      role: Roles.CORPORATION,\n      profile: {\n        name: '株式会社スポーツリーディング',\n        sport: 'スポーツ採用・マーケティング'\n      }\n    }\n  },\n  matches: {\n    'match:corp:demo:std:alice-std:bob': {\n      id: 'match:corp:demo:std:alice-std:bob',\n      corpId: 'corp:demo',\n      studentIds: ['std:alice', 'std:bob'],\n      status: MatchStatus.SCOUTED,\n      interviewType: 'タイプ:ペア',\n      createdAt: Date.now()\n    }\n  },\n  billing: [],\n  messages: [],\n  REAL_auth: null\n};\n\n/**\n * REDUCER: Purely derives next state from current state + event\n */\nexport function snsReducer(state, event) {\n  const { type, payload } = event;\n  const users = { ...state.users };\n  const matches = { ...state.matches };\n  const billing = [...state.billing];\n  const messages = state.messages ? [...state.messages] : [];\n\n  switch (type) {\n    case 'USER_REGISTER': {\n      users[payload.id] = {\n        id: payload.id,\n        role: payload.role,\n        profile: { \n          name: payload.name, \n          sport: payload.sport || '',\n          position: payload.position || '',\n          achievements: payload.achievements || '',\n          selfPR: payload.selfPR || '',\n          friends: [] \n        }\n      };\n      break;\n    }\n\n    case 'UPDATE_PROFILE': {\n      const user = users[payload.userId];\n      if (user) {\n        users[payload.userId] = {\n          ...user,\n          profile: {\n            ...user.profile,\n            ...payload.profile\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SET_FRIEND': {\n      const student = users[payload.studentId];\n      if (student) {\n        users[payload.studentId] = {\n          ...student,\n          profile: {\n            ...student.profile,\n            friends: [...new Set([...student.profile.friends, payload.friendId])]\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SEND_SCOUT': {\n      const matchId = `match:${payload.corpId}:${[...payload.studentIds].sort().join('-')}`;\n      matches[matchId] = {\n        id: matchId,\n        corpId: payload.corpId,\n        studentIds: payload.studentIds,\n        status: MatchStatus.SCOUTED,\n        interviewType: payload.studentIds.length > 1 ? 'タイプ:ペア' : 'タイプ:単体',\n        createdAt: Date.now()\n      };\n      break;\n    }\n\n    case 'REJECT_SCOUT': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.REJECTED;\n      }\n      break;\n    }\n\n    case 'CANCEL_SCOUT': {\n      // Cleanly delete the pending match since no fees are incurred yet\n      if (matches[payload.matchId]) {\n        delete matches[payload.matchId];\n      }\n      break;\n    }\n\n    case 'SET_INTERVIEW': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.INTERVIEW_SET;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_INTERVIEW : Fees.SINGLE_INTERVIEW;\n        billing.push({\n          id: `bill:${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:面談',\n          status: 'UNPAID'\n        });\n      }\n      break;\n    }\n\n    case 'MARK_HIRED': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.HIRED;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_HIRE : Fees.SINGLE_HIRE;\n        billing.push({\n          id: `bill:${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:採用',\n          status: 'UNPAID'\n        });\n      }\n      break;\n    }\n\n    case 'PAY_BILL': {\n      const idx = billing.findIndex(b => b.id === payload.billId);\n      if (idx !== -1) {\n        billing[idx] = { ...billing[idx], status: 'PAID' };\n      }\n      break;\n    }\n\n    case 'SEND_MESSAGE': {\n      messages.push({\n        id: `msg:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,\n        matchId: payload.matchId,\n        senderId: payload.senderId,\n        text: payload.text,\n        timestamp: Date.now()\n      });\n      break;\n    }\n\n    case 'SET_AUTH': {\n      return { ...state, REAL_auth: payload };\n    }\n  }\n\n  return { ...state, users, matches, billing, messages };\n}\n\n/**\n * VALIDATOR: Checks if an event is allowed given the current state\n */\nexport function snsValidator(state, event) {\n  const { type, payload } = event;\n\n  if (!payload) return false;\n\n  if (type === 'USER_REGISTER') {\n    if (!payload.id || !payload.role || !payload.name) return false;\n  }\n\n  if (type === 'SEND_MESSAGE') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    // Chat allowed during interview and after hire\n    if (match.status !== MatchStatus.INTERVIEW_SET && match.status !== MatchStatus.HIRED) return false;\n    \n    // Constraint: Must have paid the interview fee (手数料:面談) before chatting\n    const interviewBill = state.billing.find(b => b.matchId === payload.matchId && b.type === '手数料:面談');\n    if (!interviewBill || interviewBill.status !== 'PAID') return false;\n\n    // Must be a valid sender associated with the match\n    const isValidSender = match.corpId === payload.senderId || match.studentIds.includes(payload.senderId);\n    if (!isValidSender) return false;\n    if (typeof payload.text !== 'string' || payload.text.trim() === '') return false;\n  }\n\n  if (type === 'PAY_BILL') {\n    if (!payload.billId) return false;\n    const bill = state.billing.find(b => b.id === payload.billId);\n    if (!bill) return false;\n  }\n\n  if (type === 'SET_FRIEND') {\n    if (!payload.studentId || !payload.friendId) return false;\n    const s1 = state.users[payload.studentId];\n    const s2 = state.users[payload.friendId];\n    if (!s1 || !s2 || s1.role !== Roles.STUDENT || s2.role !== Roles.STUDENT) return false;\n  }\n\n  if (type === 'SET_AUTH') {\n    if (!payload.publicId || !payload.identity) return false;\n  }\n\n  if (type === 'SEND_SCOUT') {\n    // If pair scout, check eligibility\n    if (payload.studentIds.length === 2) {\n      const s1 = state.users[payload.studentIds[0]];\n      const s2 = state.users[payload.studentIds[1]];\n      if (!s1 || !s2 || !checkPairEligibility(s1, s2)) return false;\n    } else if (payload.studentIds.length === 1) {\n      const s = state.users[payload.studentIds[0]];\n      if (!s || s.role !== Roles.STUDENT) return false;\n    } else {\n      return false;\n    }\n    const c = state.users[payload.corpId];\n    if (!c || c.role !== Roles.CORPORATION) return false;\n  }\n\n  if (type === 'REJECT_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: MatchStatus.REJECTED });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  if (type === 'CANCEL_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match || match.status !== MatchStatus.SCOUTED) return false;\n  }\n\n  if (type === 'SET_INTERVIEW' || type === 'MARK_HIRED') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    \n    // Use BIBLE constraints for status transition\n    const targetStatus = type === 'SET_INTERVIEW' ? MatchStatus.INTERVIEW_SET : MatchStatus.HIRED;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: targetStatus });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  return true;\n}\n\nexport const store = new EventStore(initialState);\n\nexport function initStore() {\n  store.loadAndReplay(snsReducer);\n}\n\nexport function dispatch(event) {\n  return store.dispatch(event, snsReducer, snsValidator);\n}\n",
      "ts": 1779253015368,
      "refs": [
        {
          "kind": "import",
          "target": "./yume-core.js"
        },
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
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
      "applyId": "apply-2026-05-20-747e6d1a",
      "v": 6
    },
    {
      "content": "\nimport { EventStore, evalConstraint } from './yume-core.js';\nimport { Roles, MatchStatus, StatusTransitions, checkPairEligibility, Fees } from './BIBLE.js';\n\nconst initialState = {\n  users: {\n    'std:alice': {\n      id: 'std:alice',\n      role: Roles.STUDENT,\n      profile: {\n        nickname: '美咲 (みさ)',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将',\n        selfIntroduction: '全国高校選手権ベスト8、都リーグ得点王。チームを牽引するリーダーシップと決定力が強みです！親友の拓海とは中高大10年間同じピッチで戦い、阿吽の呼吸でパスを通せます。',\n        friends: ['std:bob']\n      }\n    },\n    'std:bob': {\n      id: 'std:bob',\n      role: Roles.STUDENT,\n      profile: {\n        nickname: '拓海 (たく)',\n        sport: 'サッカー部 (MF)',\n        position: 'ミッドフィルダー / 司令塔',\n        selfIntroduction: '関東大学2部リーグ アシスト王。広い視野から繰り出す正確なパスと、ゲームを支配する戦術眼が武器です。美咲とは長年お互いの視線だけでゴールを演出できる関係です。',\n        friends: ['std:alice']\n      }\n    },\n    'std:charlie': {\n      id: 'std:charlie',\n      role: Roles.STUDENT,\n      profile: {\n        nickname: '陸 (りく)',\n        sport: '野球部 (投手)',\n        position: 'エースピッチャー',\n        selfIntroduction: '東京六大学リーグ 最優秀防御率。最速148kmのストレートとキレのあるスライダーが武器です。チームの勝利のために、マウンド上では常に冷静さを失いません。',\n        friends: []\n      }\n    },\n    'std:dave': {\n      id: 'std:dave',\n      role: Roles.STUDENT,\n      profile: {\n        nickname: '翔太 (しょう)',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        selfIntroduction: '春季リーグ ベストナイン。投手の長所を引き出すインサイドワークと二塁送球1.9秒の強肩が売りです。陸とはバッテリーとして絶対の信頼関係があります。',\n        friends: ['std:charlie']\n      }\n    },\n    'corp:demo': {\n      id: 'corp:demo',\n      role: Roles.CORPORATION,\n      profile: {\n        name: '株式会社スポーツリーディング',\n        sport: 'スポーツ採用・マーケティング'\n      }\n    }\n  },\n  matches: {\n    'match:corp:demo:std:alice-std:bob': {\n      id: 'match:corp:demo:std:alice-std:bob',\n      corpId: 'corp:demo',\n      studentIds: ['std:alice', 'std:bob'],\n      status: MatchStatus.SCOUTED,\n      interviewType: 'タイプ:ペア',\n      createdAt: Date.now()\n    }\n  },\n  billing: [],\n  messages: [],\n  REAL_auth: null\n};\n\n/**\n * REDUCER: Purely derives next state from current state + event\n */\nexport function snsReducer(state, event) {\n  const { type, payload } = event;\n  const users = { ...state.users };\n  const matches = { ...state.matches };\n  const billing = [...state.billing];\n  const messages = state.messages ? [...state.messages] : [];\n\n  switch (type) {\n    case 'USER_REGISTER': {\n      const selfIntro = payload.selfIntroduction || payload.selfPR || payload.achievements || '';\n      users[payload.id] = {\n        id: payload.id,\n        role: payload.role,\n        profile: { \n          nickname: payload.nickname || payload.name || '新規ユーザー', \n          name: payload.name || payload.nickname || '新規ユーザー',\n          sport: payload.sport || '',\n          position: payload.position || '',\n          selfIntroduction: selfIntro,\n          selfPR: selfIntro,\n          achievements: selfIntro,\n          friends: [] \n        }\n      };\n      break;\n    }\n\n    case 'UPDATE_PROFILE': {\n      const user = users[payload.userId];\n      if (user) {\n        const p = { ...user.profile, ...payload.profile };\n        const selfIntro = p.selfIntroduction || p.selfPR || p.achievements || '';\n        p.selfIntroduction = selfIntro;\n        p.selfPR = selfIntro;\n        p.achievements = selfIntro;\n        p.name = p.nickname || p.name || '新規ユーザー';\n        p.nickname = p.nickname || p.name || '新規ユーザー';\n        users[payload.userId] = {\n          ...user,\n          profile: p\n        };\n      }\n      break;\n    }\n\n    case 'SET_FRIEND': {\n      const student = users[payload.studentId];\n      if (student) {\n        users[payload.studentId] = {\n          ...student,\n          profile: {\n            ...student.profile,\n            friends: [...new Set([...student.profile.friends, payload.friendId])]\n          }\n        };\n      }\n      break;\n    }\n\n    case 'SEND_SCOUT': {\n      const matchId = `match:${payload.corpId}:${[...payload.studentIds].sort().join('-')}`;\n      matches[matchId] = {\n        id: matchId,\n        corpId: payload.corpId,\n        studentIds: payload.studentIds,\n        status: MatchStatus.SCOUTED,\n        interviewType: payload.studentIds.length > 1 ? 'タイプ:ペア' : 'タイプ:単体',\n        createdAt: Date.now()\n      };\n      break;\n    }\n\n    case 'REJECT_SCOUT': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.REJECTED;\n      }\n      break;\n    }\n\n    case 'CANCEL_SCOUT': {\n      // Cleanly delete the pending match since no fees are incurred yet\n      if (matches[payload.matchId]) {\n        delete matches[payload.matchId];\n      }\n      break;\n    }\n\n    case 'SET_INTERVIEW': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.INTERVIEW_SET;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_INTERVIEW : Fees.SINGLE_INTERVIEW;\n        billing.push({\n          id: `bill:${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:面談',\n          status: 'UNPAID'\n        });\n      }\n      break;\n    }\n\n    case 'MARK_HIRED': {\n      const match = matches[payload.matchId];\n      if (match) {\n        match.status = MatchStatus.HIRED;\n        const fee = match.interviewType === 'タイプ:ペア' ? Fees.PAIR_HIRE : Fees.SINGLE_HIRE;\n        billing.push({\n          id: `bill:${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,\n          matchId: match.id,\n          amount: fee,\n          type: '手数料:採用',\n          status: 'UNPAID'\n        });\n      }\n      break;\n    }\n\n    case 'PAY_BILL': {\n      const idx = billing.findIndex(b => b.id === payload.billId);\n      if (idx !== -1) {\n        billing[idx] = { ...billing[idx], status: 'PAID' };\n      }\n      break;\n    }\n\n    case 'SEND_MESSAGE': {\n      messages.push({\n        id: `msg:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,\n        matchId: payload.matchId,\n        senderId: payload.senderId,\n        text: payload.text,\n        timestamp: Date.now()\n      });\n      break;\n    }\n\n    case 'SET_AUTH': {\n      return { ...state, REAL_auth: payload };\n    }\n  }\n\n  return { ...state, users, matches, billing, messages };\n}\n\n/**\n * VALIDATOR: Checks if an event is allowed given the current state\n */\nexport function snsValidator(state, event) {\n  const { type, payload } = event;\n\n  if (!payload) return false;\n\n  if (type === 'USER_REGISTER') {\n    if (!payload.id || !payload.role) return false;\n    if (!payload.nickname && !payload.name) return false;\n  }\n\n  if (type === 'SEND_MESSAGE') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    // Chat allowed during interview and after hire\n    if (match.status !== MatchStatus.INTERVIEW_SET && match.status !== MatchStatus.HIRED) return false;\n    \n    // Constraint: Must have paid the interview fee (手数料:面談) before chatting\n    const interviewBill = state.billing.find(b => b.matchId === payload.matchId && b.type === '手数料:面談');\n    if (!interviewBill || interviewBill.status !== 'PAID') return false;\n\n    // Must be a valid sender associated with the match\n    const isValidSender = match.corpId === payload.senderId || match.studentIds.includes(payload.senderId);\n    if (!isValidSender) return false;\n    if (typeof payload.text !== 'string' || payload.text.trim() === '') return false;\n  }\n\n  if (type === 'PAY_BILL') {\n    if (!payload.billId) return false;\n    const bill = state.billing.find(b => b.id === payload.billId);\n    if (!bill) return false;\n  }\n\n  if (type === 'SET_FRIEND') {\n    if (!payload.studentId || !payload.friendId) return false;\n    const s1 = state.users[payload.studentId];\n    const s2 = state.users[payload.friendId];\n    if (!s1 || !s2 || s1.role !== Roles.STUDENT || s2.role !== Roles.STUDENT) return false;\n  }\n\n  if (type === 'SET_AUTH') {\n    if (!payload.publicId || !payload.identity) return false;\n  }\n\n  if (type === 'SEND_SCOUT') {\n    // If pair scout, check eligibility\n    if (payload.studentIds.length === 2) {\n      const s1 = state.users[payload.studentIds[0]];\n      const s2 = state.users[payload.studentIds[1]];\n      if (!s1 || !s2 || !checkPairEligibility(s1, s2)) return false;\n    } else if (payload.studentIds.length === 1) {\n      const s = state.users[payload.studentIds[0]];\n      if (!s || s.role !== Roles.STUDENT) return false;\n    } else {\n      return false;\n    }\n    const c = state.users[payload.corpId];\n    if (!c || c.role !== Roles.CORPORATION) return false;\n  }\n\n  if (type === 'REJECT_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: MatchStatus.REJECTED });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  if (type === 'CANCEL_SCOUT') {\n    const match = state.matches[payload.matchId];\n    if (!match || match.status !== MatchStatus.SCOUTED) return false;\n  }\n\n  if (type === 'SET_INTERVIEW' || type === 'MARK_HIRED') {\n    const match = state.matches[payload.matchId];\n    if (!match) return false;\n    \n    // Use BIBLE constraints for status transition\n    const targetStatus = type === 'SET_INTERVIEW' ? MatchStatus.INTERVIEW_SET : MatchStatus.HIRED;\n    const worlds = evalConstraint(StatusTransitions, { from: match.status, to: targetStatus });\n    if (worlds._contradiction || !worlds.worlds[0]._isValid) return false;\n  }\n\n  return true;\n}\n\nexport const store = new EventStore(initialState);\n\nexport function initStore() {\n  store.loadAndReplay(snsReducer);\n}\n\nexport function dispatch(event) {\n  return store.dispatch(event, snsReducer, snsValidator);\n}\n",
      "ts": 1779254991391,
      "refs": [
        {
          "kind": "import",
          "target": "./yume-core.js"
        },
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
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
      "applyId": "apply-2026-05-20-93b3e4b4",
      "v": 7
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
    ],
    "apply:apply-2026-05-20-5108b409": [
      {
        "id": "n-4270e92a-9590-4a70-8b3f-f0bf56d194b1",
        "author": "human",
        "ts": 1779252136028,
        "text": "Safeguard imports inside HEAD"
      }
    ],
    "apply:apply-2026-05-20-a095d779": [
      {
        "id": "n-18f927f3-c5ce-45b6-b609-703d06eabd51",
        "author": "human",
        "ts": 1779252764911,
        "text": "Add messages array and SEND_MESSAGE reducer/validator"
      }
    ],
    "apply:apply-2026-05-20-bcf854c7": [
      {
        "id": "n-8625ef63-bbac-420b-b23f-0fbee9d55719",
        "author": "human",
        "ts": 1779252896288,
        "text": "Enforce chat routing restriction until interview fee billing status is PAID"
      }
    ],
    "apply:apply-2026-05-20-747e6d1a": [
      {
        "id": "n-17e2c28f-9d39-41df-89fe-39559aa05383",
        "author": "human",
        "ts": 1779253015374,
        "text": "Export initStore for localStorage replay initialization"
      }
    ],
    "apply:apply-2026-05-20-93b3e4b4": [
      {
        "id": "n-a1f3701a-654c-47c5-99dc-bb3c5ede9cd0",
        "author": "human",
        "ts": 1779254991396,
        "text": "Implement symmetric fallback mapping in USER_REGISTER and UPDATE_PROFILE reducers"
      }
    ]
  }
};

// === HEAD ===

import { EventStore, evalConstraint } from './yume-core.js';
import { Roles, MatchStatus, StatusTransitions, checkPairEligibility, Fees } from './BIBLE.js';

const initialState = {
  users: {
    'std:alice': {
      id: 'std:alice',
      role: Roles.STUDENT,
      profile: {
        nickname: '美咲 (みさ)',
        sport: 'サッカー部 (FW)',
        position: 'フォワード / 主将',
        selfIntroduction: '全国高校選手権ベスト8、都リーグ得点王。チームを牽引するリーダーシップと決定力が強みです！親友の拓海とは中高大10年間同じピッチで戦い、阿吽の呼吸でパスを通せます。',
        friends: ['std:bob']
      }
    },
    'std:bob': {
      id: 'std:bob',
      role: Roles.STUDENT,
      profile: {
        nickname: '拓海 (たく)',
        sport: 'サッカー部 (MF)',
        position: 'ミッドフィルダー / 司令塔',
        selfIntroduction: '関東大学2部リーグ アシスト王。広い視野から繰り出す正確なパスと、ゲームを支配する戦術眼が武器です。美咲とは長年お互いの視線だけでゴールを演出できる関係です。',
        friends: ['std:alice']
      }
    },
    'std:charlie': {
      id: 'std:charlie',
      role: Roles.STUDENT,
      profile: {
        nickname: '陸 (りく)',
        sport: '野球部 (投手)',
        position: 'エースピッチャー',
        selfIntroduction: '東京六大学リーグ 最優秀防御率。最速148kmのストレートとキレのあるスライダーが武器です。チームの勝利のために、マウンド上では常に冷静さを失いません。',
        friends: []
      }
    },
    'std:dave': {
      id: 'std:dave',
      role: Roles.STUDENT,
      profile: {
        nickname: '翔太 (しょう)',
        sport: '野球部 (捕手)',
        position: '正捕手 / 副主将',
        selfIntroduction: '春季リーグ ベストナイン。投手の長所を引き出すインサイドワークと二塁送球1.9秒の強肩が売りです。陸とはバッテリーとして絶対の信頼関係があります。',
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
  messages: [],
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
  const messages = state.messages ? [...state.messages] : [];

  switch (type) {
    case 'USER_REGISTER': {
      const selfIntro = payload.selfIntroduction || payload.selfPR || payload.achievements || '';
      users[payload.id] = {
        id: payload.id,
        role: payload.role,
        profile: { 
          nickname: payload.nickname || payload.name || '新規ユーザー', 
          name: payload.name || payload.nickname || '新規ユーザー',
          sport: payload.sport || '',
          position: payload.position || '',
          selfIntroduction: selfIntro,
          selfPR: selfIntro,
          achievements: selfIntro,
          friends: [] 
        }
      };
      break;
    }

    case 'UPDATE_PROFILE': {
      const user = users[payload.userId];
      if (user) {
        const p = { ...user.profile, ...payload.profile };
        const selfIntro = p.selfIntroduction || p.selfPR || p.achievements || '';
        p.selfIntroduction = selfIntro;
        p.selfPR = selfIntro;
        p.achievements = selfIntro;
        p.name = p.nickname || p.name || '新規ユーザー';
        p.nickname = p.nickname || p.name || '新規ユーザー';
        users[payload.userId] = {
          ...user,
          profile: p
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
          id: `bill:${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          matchId: match.id,
          amount: fee,
          type: '手数料:面談',
          status: 'UNPAID'
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
          id: `bill:${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          matchId: match.id,
          amount: fee,
          type: '手数料:採用',
          status: 'UNPAID'
        });
      }
      break;
    }

    case 'PAY_BILL': {
      const idx = billing.findIndex(b => b.id === payload.billId);
      if (idx !== -1) {
        billing[idx] = { ...billing[idx], status: 'PAID' };
      }
      break;
    }

    case 'SEND_MESSAGE': {
      messages.push({
        id: `msg:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        matchId: payload.matchId,
        senderId: payload.senderId,
        text: payload.text,
        timestamp: Date.now()
      });
      break;
    }

    case 'SET_AUTH': {
      return { ...state, REAL_auth: payload };
    }
  }

  return { ...state, users, matches, billing, messages };
}

/**
 * VALIDATOR: Checks if an event is allowed given the current state
 */
export function snsValidator(state, event) {
  const { type, payload } = event;

  if (!payload) return false;

  if (type === 'USER_REGISTER') {
    if (!payload.id || !payload.role) return false;
    if (!payload.nickname && !payload.name) return false;
  }

  if (type === 'SEND_MESSAGE') {
    const match = state.matches[payload.matchId];
    if (!match) return false;
    // Chat allowed during interview and after hire
    if (match.status !== MatchStatus.INTERVIEW_SET && match.status !== MatchStatus.HIRED) return false;
    
    // Constraint: Must have paid the interview fee (手数料:面談) before chatting
    const interviewBill = state.billing.find(b => b.matchId === payload.matchId && b.type === '手数料:面談');
    if (!interviewBill || interviewBill.status !== 'PAID') return false;

    // Must be a valid sender associated with the match
    const isValidSender = match.corpId === payload.senderId || match.studentIds.includes(payload.senderId);
    if (!isValidSender) return false;
    if (typeof payload.text !== 'string' || payload.text.trim() === '') return false;
  }

  if (type === 'PAY_BILL') {
    if (!payload.billId) return false;
    const bill = state.billing.find(b => b.id === payload.billId);
    if (!bill) return false;
  }

  if (type === 'SET_FRIEND') {
    if (!payload.studentId || !payload.friendId) return false;
    if (payload.studentId === payload.friendId) return false; // Block self-linking
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

export function initStore() {
  store.loadAndReplay(snsReducer);
}

export function dispatch(event) {
  return store.dispatch(event, snsReducer, snsValidator);
}

// === /HEAD ===
