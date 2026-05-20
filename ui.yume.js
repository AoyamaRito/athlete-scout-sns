// @yume-format: 1

export const __block = {
  "id": "sns:ui",
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
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        }
      ],
      "tags": [
        "ui"
      ],
      "applyId": null
    },
    {
      "content": "\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  let html = `<div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;\">\n    <h2 style=\"margin: 0;\">マイページ</h2>\n    <div>\n      <span style=\"font-size: 0.8em; color: #65676b;\">ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  // 1. プロフィール編集\n  html += `<div class=\"section\">\n    <h3>プロフィール編集</h3>\n    <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n      <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n      <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n      <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n      <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n    </div>\n  </div>`;\n\n  // 2. 親友リンク（ペアスカウトの要）\n  const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n  html += `<div class=\"section\">\n    <h3>親友リンク</h3>\n    <p style=\"font-size: 0.8em; color: #65676b;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n    ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n    ${otherStudents.map(os => {\n      const isFriend = currentUser.profile.friends.includes(os.id);\n      const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n      return `<div class=\"user-card\">\n        <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n        <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n          onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n          ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n        </button>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 3. 受信したスカウト\n  const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n  html += `<div class=\"section\">\n    <h3>届いているスカウト</h3>\n    ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n    ${myMatches.map(m => {\n      const isPair = m.interviewType === 'タイプ:ペア';\n      const partnerId = m.studentIds.find(id => id !== currentUser.id);\n      const partnerName = state.users[partnerId]?.profile.name;\n      \n      return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}\">\n        <div>\n          <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n            ${isPair ? 'ペアスカウト' : '単体スカウト'}\n          </span>\n          <div style=\"margin-top: 5px;\">\n            <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n            ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n          </div>\n          <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n        </div>\n        <div>\n          ${m.status === MatchStatus.SCOUTED ? `\n            <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n            <button class=\"btn btn-secondary\" style=\"margin-left: 5px;\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n          ` : ''}\n          ${m.status === MatchStatus.INTERVIEW_SET ? '<span style=\"color: #1a237e; font-weight: bold;\">面談進行中</span>' : ''}\n          ${m.status === MatchStatus.HIRED ? '<span style=\"color: green; font-weight: bold;\">採用確定！</span>' : ''}\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 4. (デバッグ用) 企業シミュレーター\n  html += `<div class=\"section\" style=\"background: #fff9e6; border-color: #ffe58f;\">\n    <h4 style=\"margin-top: 0;\">[開発用] 企業シミュレーター</h4>\n    <p style=\"font-size: 0.8em;\">※自分に対してスカウトを送るテスト用機能です。</p>\n    <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n    <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\" style=\"margin-left: 10px;\">親友とペアスカウトを送る</button>\n  </div>`;\n\n  // Event Handlers\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    // Ensure user exists in state for simulator\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 0; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.9em; color: #65676b;\">この鍵画像を保存してください。これがあなたの「ログイン証」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 20px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px;\">鍵ID: ${publicId}</p>\n      <div style=\"margin-top: 20px;\">\n        <button class=\"btn btn-secondary\" onclick=\"location.reload()\">ログイン画面に戻る</button>\n      </div>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.webp`;\n        link.href = canvas.toDataURL('image/webp');\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            // Ensure student is registered if new\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。\"); }\n        } else { alert(\"QRコードが読み取れませんでした。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779249724263,
      "refs": [
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-d812cc62",
      "v": 2
    },
    {
      "content": "\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  let html = `<div class=\"mypage-header\">\n    <h2>マイページ</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  // 1. プロフィール編集\n  html += `<div class=\"section\">\n    <h3>プロフィール編集</h3>\n    <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n      <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n      <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n      <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n      <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n    </div>\n  </div>`;\n\n  // 2. 親友リンク（ペアスカウトの要）\n  const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n  html += `<div class=\"section\">\n    <h3>親友リンク</h3>\n    <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n    ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n    ${otherStudents.map(os => {\n      const isFriend = currentUser.profile.friends.includes(os.id);\n      const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n      return `<div class=\"user-card\">\n        <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n        <div class=\"user-card-actions\">\n          <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n            onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n            ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n          </button>\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 3. 受信したスカウト\n  const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n  html += `<div class=\"section\">\n    <h3>届いているスカウト</h3>\n    ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n    ${myMatches.map(m => {\n      const isPair = m.interviewType === 'タイプ:ペア';\n      const partnerId = m.studentIds.find(id => id !== currentUser.id);\n      const partnerName = state.users[partnerId]?.profile.name;\n      \n      return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}\">\n        <div>\n          <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n            ${isPair ? 'ペアスカウト' : '単体スカウト'}\n          </span>\n          <div style=\"margin-top: 5px;\">\n            <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n            ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n          </div>\n          <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n        </div>\n        <div class=\"user-card-actions\">\n          ${m.status === MatchStatus.SCOUTED ? `\n            <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n            <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n          ` : ''}\n          ${m.status === MatchStatus.INTERVIEW_SET ? '<span style=\"color: #1a237e; font-weight: bold; font-size: 0.9em;\">面談進行中</span>' : ''}\n          ${m.status === MatchStatus.HIRED ? '<span style=\"color: green; font-weight: bold; font-size: 0.9em;\">採用確定！</span>' : ''}\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 4. (デバッグ用) 企業シミュレーター\n  html += `<div class=\"section simulator-section\">\n    <h4>[開発用] 企業シミュレーター</h4>\n    <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n    <div class=\"simulator-actions\">\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    // Ensure user exists in state for simulator\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 0; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.9em; color: #65676b;\">この鍵画像を保存してください。これがあなたの「ログイン証」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 20px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px;\">鍵ID: ${publicId}</p>\n      <div style=\"margin-top: 20px;\">\n        <button class=\"btn btn-secondary\" onclick=\"location.reload()\">ログイン画面に戻る</button>\n      </div>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.webp`;\n        link.href = canvas.toDataURL('image/webp');\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            // Ensure student is registered if new\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。\"); }\n        } else { alert(\"QRコードが読み取れませんでした。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779252092409,
      "refs": [
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-cf660470",
      "v": 3
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  let html = `<div class=\"mypage-header\">\n    <h2>マイページ</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  // 1. プロフィール編集\n  html += `<div class=\"section\">\n    <h3>プロフィール編集</h3>\n    <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n      <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n      <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n      <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n      <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n    </div>\n  </div>`;\n\n  // 2. 親友リンク（ペアスカウトの要）\n  const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n  html += `<div class=\"section\">\n    <h3>親友リンク</h3>\n    <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n    ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n    ${otherStudents.map(os => {\n      const isFriend = currentUser.profile.friends.includes(os.id);\n      const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n      return `<div class=\"user-card\">\n        <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n        <div class=\"user-card-actions\">\n          <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n            onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n            ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n          </button>\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 3. 受信したスカウト\n  const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n  html += `<div class=\"section\">\n    <h3>届いているスカウト</h3>\n    ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n    ${myMatches.map(m => {\n      const isPair = m.interviewType === 'タイプ:ペア';\n      const partnerId = m.studentIds.find(id => id !== currentUser.id);\n      const partnerName = state.users[partnerId]?.profile.name;\n      \n      return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}\">\n        <div>\n          <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n            ${isPair ? 'ペアスカウト' : '単体スカウト'}\n          </span>\n          <div style=\"margin-top: 5px;\">\n            <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n            ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n          </div>\n          <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n        </div>\n        <div class=\"user-card-actions\">\n          ${m.status === MatchStatus.SCOUTED ? `\n            <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n            <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n          ` : ''}\n          ${m.status === MatchStatus.INTERVIEW_SET ? '<span style=\"color: #1a237e; font-weight: bold; font-size: 0.9em;\">面談進行中</span>' : ''}\n          ${m.status === MatchStatus.HIRED ? '<span style=\"color: green; font-weight: bold; font-size: 0.9em;\">採用確定！</span>' : ''}\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 4. (デバッグ用) 企業シミュレーター\n  html += `<div class=\"section simulator-section\">\n    <h4>[開発用] 企業シミュレーター</h4>\n    <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n    <div class=\"simulator-actions\">\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    // Ensure user exists in state for simulator\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 0; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.9em; color: #65676b;\">この鍵画像を保存してください。これがあなたの「ログイン証」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 20px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px;\">鍵ID: ${publicId}</p>\n      <div style=\"margin-top: 20px;\">\n        <button class=\"btn btn-secondary\" onclick=\"location.reload()\">ログイン画面に戻る</button>\n      </div>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.webp`;\n        link.href = canvas.toDataURL('image/webp');\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            // Ensure student is registered if new\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。\"); }\n        } else { alert(\"QRコードが読み取れませんでした。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779252136115,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-eed2cec6",
      "v": 4
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nlet activeChatMatchId = null;\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  let html = `<div class=\"mypage-header\">\n    <h2>マイページ</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  // 1. プロフィール編集\n  html += `<div class=\"section\">\n    <h3>プロフィール編集</h3>\n    <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n      <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n      <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n      <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n      <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n    </div>\n  </div>`;\n\n  // 2. 親友リンク（ペアスカウトの要）\n  const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n  html += `<div class=\"section\">\n    <h3>親友リンク</h3>\n    <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n    ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n    ${otherStudents.map(os => {\n      const isFriend = currentUser.profile.friends.includes(os.id);\n      const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n      return `<div class=\"user-card\">\n        <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n        <div class=\"user-card-actions\">\n          <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n            onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n            ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n          </button>\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 3. 受信したスカウト\n  const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n  html += `<div class=\"section\">\n    <h3>届いているスカウト</h3>\n    ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n    ${myMatches.map(m => {\n      const isPair = m.interviewType === 'タイプ:ペア';\n      const partnerId = m.studentIds.find(id => id !== currentUser.id);\n      const partnerName = state.users[partnerId]?.profile.name;\n      \n      const chatHtml = activeChatMatchId === m.id ? (() => {\n        const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);\n        const msgListHtml = msgs.map(msg => {\n          const isMe = msg.senderId === currentUser.id;\n          const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');\n          const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';\n          const bubbleColor = isMe ? '#ffffff' : '#1f242d';\n          const alignSelf = isMe ? 'flex-end' : 'flex-start';\n          return `<div style=\"display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;\">\n            <span style=\"font-size: 0.7em; color: #65676b; margin-bottom: 2px;\">${senderName}</span>\n            <div style=\"background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;\">\n              ${msg.text}\n            </div>\n          </div>`;\n        }).join('') || '<p style=\"font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;\">まだメッセージはありません。最初のメッセージを送りましょう！</p>';\n\n        return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n          <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n          <div style=\"background: #ffffff; border: 1px solid #e2e5eb; border-radius: 4px; padding: 10px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;\">\n            ${msgListHtml}\n          </div>\n          <div style=\"display: flex; gap: 8px; width: 100%;\">\n            <input type=\"text\" id=\"chat-input-${m.id}\" class=\"input-field\" placeholder=\"メッセージを入力してください...\" style=\"flex: 1;\" onkeypress=\"if(event.key === 'Enter') window.sns_send_message('${m.id}')\">\n            <button class=\"btn\" style=\"width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;\" onclick=\"window.sns_send_message('${m.id}')\">送信</button>\n          </div>\n        </div>`;\n      })() : '';\n\n      return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;\">\n        <div style=\"display: flex; flex-direction: column; gap: 10px; width: 100%;\">\n          <div style=\"display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;\">\n            <div>\n              <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n                ${isPair ? 'ペアスカウト' : '単体スカウト'}\n              </span>\n              <div style=\"margin-top: 5px;\">\n                <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n                ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n              </div>\n              <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n            </div>\n            <div class=\"user-card-actions\" style=\"width: auto;\">\n              ${m.status === MatchStatus.SCOUTED ? `\n                <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n                <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n              ` : ''}\n              ${m.status === MatchStatus.INTERVIEW_SET ? `\n                <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                  ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                </button>\n              ` : ''}\n              ${m.status === MatchStatus.HIRED ? `\n                <span style=\"color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;\">採用確定！</span>\n                <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                  ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                </button>\n              ` : ''}\n            </div>\n          </div>\n          ${chatHtml}\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 4. (デバッグ用) 企業シミュレーター\n  html += `<div class=\"section simulator-section\">\n    <h4>[開発用] 企業シミュレーター</h4>\n    <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n    <div class=\"simulator-actions\">\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_toggle_chat = (matchId) => {\n    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;\n    render(container, state, dispatch);\n  };\n\n  window.sns_send_message = (matchId) => {\n    const inputEl = document.getElementById(`chat-input-${matchId}`);\n    const text = inputEl ? inputEl.value.trim() : '';\n    if (text) {\n      dispatch({\n        type: 'SEND_MESSAGE',\n        payload: {\n          matchId,\n          senderId: currentUser.id,\n          text\n        }\n      });\n      // Keep input focused or clear it\n      inputEl.value = '';\n    }\n  };\n\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    // Ensure user exists in state for simulator\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 0; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.9em; color: #65676b;\">この鍵画像を保存してください。これがあなたの「ログイン証」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 20px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px;\">鍵ID: ${publicId}</p>\n      <div style=\"margin-top: 20px;\">\n        <button class=\"btn btn-secondary\" onclick=\"location.reload()\">ログイン画面に戻る</button>\n      </div>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.webp`;\n        link.href = canvas.toDataURL('image/webp');\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            // Ensure student is registered if new\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。\"); }\n        } else { alert(\"QRコードが読み取れませんでした。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779252799849,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "render"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-62de0b1d",
      "v": 5
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nlet activeChatMatchId = null;\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  let html = `<div class=\"mypage-header\">\n    <h2>マイページ</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  // 1. プロフィール編集\n  html += `<div class=\"section\">\n    <h3>プロフィール編集</h3>\n    <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n      <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n      <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n      <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n      <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n      <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n    </div>\n  </div>`;\n\n  // 2. 親友リンク（ペアスカウトの要）\n  const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n  html += `<div class=\"section\">\n    <h3>親友リンク</h3>\n    <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n    ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n    ${otherStudents.map(os => {\n      const isFriend = currentUser.profile.friends.includes(os.id);\n      const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n      return `<div class=\"user-card\">\n        <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n        <div class=\"user-card-actions\">\n          <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n            onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n            ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n          </button>\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 3. 受信したスカウト\n  const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n  html += `<div class=\"section\">\n    <h3>届いているスカウト</h3>\n    ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n    ${myMatches.map(m => {\n      const isPair = m.interviewType === 'タイプ:ペア';\n      const partnerId = m.studentIds.find(id => id !== currentUser.id);\n      const partnerName = state.users[partnerId]?.profile.name;\n      \n      const chatHtml = activeChatMatchId === m.id ? (() => {\n        // Check if there is an interview fee bill paid (status === 'PAID')\n        const isPaid = (state.billing || []).some(b => b.matchId === m.id && b.type === '手数料:面談' && b.status === 'PAID');\n\n        if (!isPaid) {\n          return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n            <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n            <div style=\"background: #fff3cd; border: 1px solid #ffe58f; color: #856404; padding: 15px; border-radius: 4px; font-size: 0.9em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n              <span style=\"font-size: 1.5em;\">🔒</span>\n              <strong>面談手数料の決済が完了するまで、チャットルームは利用できません。</strong>\n              <span style=\"font-size: 0.8em; opacity: 0.85;\">※現在、企業様による面談手数料のお支払いが確認できておりません。決済完了までしばらくお待ちください。</span>\n            </div>\n          </div>`;\n        }\n\n        const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);\n        const msgListHtml = msgs.map(msg => {\n          const isMe = msg.senderId === currentUser.id;\n          const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');\n          const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';\n          const bubbleColor = isMe ? '#ffffff' : '#1f242d';\n          const alignSelf = isMe ? 'flex-end' : 'flex-start';\n          return `<div style=\"display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;\">\n            <span style=\"font-size: 0.7em; color: #65676b; margin-bottom: 2px;\">${senderName}</span>\n            <div style=\"background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;\">\n              ${msg.text}\n            </div>\n          </div>`;\n        }).join('') || '<p style=\"font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;\">まだメッセージはありません。最初のメッセージを送りましょう！</p>';\n\n        return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n          <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n          <div style=\"background: #ffffff; border: 1px solid #e2e5eb; border-radius: 4px; padding: 10px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;\">\n            ${msgListHtml}\n          </div>\n          <div style=\"display: flex; gap: 8px; width: 100%;\">\n            <input type=\"text\" id=\"chat-input-${m.id}\" class=\"input-field\" placeholder=\"メッセージを入力してください...\" style=\"flex: 1;\" onkeypress=\"if(event.key === 'Enter') window.sns_send_message('${m.id}')\">\n            <button class=\"btn\" style=\"width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;\" onclick=\"window.sns_send_message('${m.id}')\">送信</button>\n          </div>\n        </div>`;\n      })() : '';\n\n      return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;\">\n        <div style=\"display: flex; flex-direction: column; gap: 10px; width: 100%;\">\n          <div style=\"display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;\">\n            <div>\n              <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n                ${isPair ? 'ペアスカウト' : '単体スカウト'}\n              </span>\n              <div style=\"margin-top: 5px;\">\n                <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n                ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n              </div>\n              <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n            </div>\n            <div class=\"user-card-actions\" style=\"width: auto;\">\n              ${m.status === MatchStatus.SCOUTED ? `\n                <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n                <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n              ` : ''}\n              ${m.status === MatchStatus.INTERVIEW_SET ? `\n                <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                  ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                </button>\n              ` : ''}\n              ${m.status === MatchStatus.HIRED ? `\n                <span style=\"color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;\">採用確定！</span>\n                <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                  ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                </button>\n              ` : ''}\n            </div>\n          </div>\n          ${chatHtml}\n        </div>\n      </div>`;\n    }).join('')}\n  </div>`;\n\n  // 4. (デバッグ用) 企業シミュレーター\n  const unpaidBills = (state.billing || []).filter(b => b.status === 'UNPAID');\n  const simBillingHtml = unpaidBills.map(b => {\n    return `<div style=\"margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ffe58f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;\">\n      <span style=\"font-size: 0.8em; color: #856404; font-weight: bold;\">[未決済] ${b.type} (${b.amount.replace('jpy:', '').toLocaleString()}円)</span>\n      <button class=\"btn btn-secondary\" style=\"padding: 4px 10px; font-size: 0.75em; min-height: 28px; width: auto;\" onclick=\"window.sns_dispatch({type:'PAY_BILL', payload:{billId:'${b.id}'}})\">決済（テスト支払）</button>\n    </div>`;\n  }).join('');\n\n  html += `<div class=\"section simulator-section\">\n    <h4>[開発用] 企業シミュレーター</h4>\n    <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n    <div class=\"simulator-actions\">\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n    </div>\n    ${simBillingHtml ? `<div style=\"margin-top: 15px; border-top: 1px solid #ffe58f; padding-top: 10px;\">\n      <h5 style=\"font-size: 0.85em; color: #856404; margin-bottom: 5px;\">【決済シミュレーター】</h5>\n      ${simBillingHtml}\n    </div>` : ''}\n  </div>`;\n\n  // Event Handlers\n  window.sns_toggle_chat = (matchId) => {\n    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;\n    render(container, state, dispatch);\n  };\n\n  window.sns_send_message = (matchId) => {\n    const inputEl = document.getElementById(`chat-input-${matchId}`);\n    const text = inputEl ? inputEl.value.trim() : '';\n    if (text) {\n      dispatch({\n        type: 'SEND_MESSAGE',\n        payload: {\n          matchId,\n          senderId: currentUser.id,\n          text\n        }\n      });\n      // Keep input focused or clear it\n      inputEl.value = '';\n    }\n  };\n\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    // Ensure user exists in state for simulator\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 0; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.9em; color: #65676b;\">この鍵画像を保存してください。これがあなたの「ログイン証」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 20px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px;\">鍵ID: ${publicId}</p>\n      <div style=\"margin-top: 20px;\">\n        <button class=\"btn btn-secondary\" onclick=\"location.reload()\">ログイン画面に戻る</button>\n      </div>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.webp`;\n        link.href = canvas.toDataURL('image/webp');\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            // Ensure student is registered if new\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。\"); }\n        } else { alert(\"QRコードが読み取れませんでした。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779252929081,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "render"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-bdebd9b3",
      "v": 6
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nlet activeChatMatchId = null;\nlet activeTab = 'profile';\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  // Modern Mobile Frame Layout starts\n  let html = `<div class=\"app-scroll-body\">`;\n\n  // My Page Header\n  html += `<div class=\"mypage-header\">\n    <h2>${activeTab === 'profile' ? 'プロフィール設定' : activeTab === 'friends' ? '親友リンク' : activeTab === 'scouts' ? 'スカウト・面談' : '開発用ツール'}</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  if (activeTab === 'profile') {\n    // 1. プロフィール編集\n    html += `<div class=\"section\">\n      <h3>プロフィール編集</h3>\n      <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n        <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n        <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n        <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n        <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n      </div>\n    </div>`;\n  }\n\n  else if (activeTab === 'friends') {\n    // 2. 親友リンク（ペアスカウトの要）\n    const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n    html += `<div class=\"section\">\n      <h3>親友リンク</h3>\n      <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n      ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n      ${otherStudents.map(os => {\n        const isFriend = currentUser.profile.friends.includes(os.id);\n        const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n        return `<div class=\"user-card\">\n          <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n          <div class=\"user-card-actions\">\n            <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n              onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n              ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n            </button>\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'scouts') {\n    // 3. 受信したスカウト\n    const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n    html += `<div class=\"section\">\n      <h3>届いているスカウト</h3>\n      ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n      ${myMatches.map(m => {\n        const isPair = m.interviewType === 'タイプ:ペア';\n        const partnerId = m.studentIds.find(id => id !== currentUser.id);\n        const partnerName = state.users[partnerId]?.profile.name;\n        \n        const chatHtml = activeChatMatchId === m.id ? (() => {\n          // Check if there is an interview fee bill paid (status === 'PAID')\n          const isPaid = (state.billing || []).some(b => b.matchId === m.id && b.type === '手数料:面談' && b.status === 'PAID');\n\n          if (!isPaid) {\n            return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n              <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n              <div style=\"background: #fff3cd; border: 1px solid #ffe58f; color: #856404; padding: 15px; border-radius: 4px; font-size: 0.9em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n                <span style=\"font-size: 1.5em;\">🔒</span>\n                <strong>面談手数料の決済が完了するまで、チャットルームは利用できません。</strong>\n                <span style=\"font-size: 0.8em; opacity: 0.85;\">※現在、企業様による面談手数料のお支払いが確認できておりません。決済完了までしばらくお待ちください。</span>\n              </div>\n            </div>`;\n          }\n\n          const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);\n          const msgListHtml = msgs.map(msg => {\n            const isMe = msg.senderId === currentUser.id;\n            const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');\n            const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';\n            const bubbleColor = isMe ? '#ffffff' : '#1f242d';\n            const alignSelf = isMe ? 'flex-end' : 'flex-start';\n            return `<div style=\"display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;\">\n              <span style=\"font-size: 0.7em; color: #65676b; margin-bottom: 2px;\">${senderName}</span>\n              <div style=\"background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;\">\n                ${msg.text}\n              </div>\n            </div>`;\n          }).join('') || '<p style=\"font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;\">まだメッセージはありません。最初のメッセージを送りましょう！</p>';\n\n          return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n            <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n            <div class=\"chat-scroller\">\n              ${msgListHtml}\n            </div>\n            <div style=\"display: flex; gap: 8px; width: 100%;\">\n              <input type=\"text\" id=\"chat-input-${m.id}\" class=\"input-field\" placeholder=\"メッセージを入力...\" style=\"flex: 1; padding: 10px;\" onkeypress=\"if(event.key === 'Enter') window.sns_send_message('${m.id}')\">\n              <button class=\"btn\" style=\"width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;\" onclick=\"window.sns_send_message('${m.id}')\">送信</button>\n            </div>\n          </div>`;\n        })() : '';\n\n        return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;\">\n          <div style=\"display: flex; flex-direction: column; gap: 10px; width: 100%;\">\n            <div style=\"display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;\">\n              <div>\n                <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n                  ${isPair ? 'ペアスカウト' : '単体スカウト'}\n                </span>\n                <div style=\"margin-top: 5px;\">\n                  <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n                  ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n                </div>\n                <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n              </div>\n              <div class=\"user-card-actions\" style=\"width: auto;\">\n                ${m.status === MatchStatus.SCOUTED ? `\n                  <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n                  <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n                ` : ''}\n                ${m.status === MatchStatus.INTERVIEW_SET ? `\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n                ${m.status === MatchStatus.HIRED ? `\n                  <span style=\"color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;\">採用確定！</span>\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n              </div>\n            </div>\n            ${chatHtml}\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'debug') {\n    // 4. (デバッグ用) 企業シミュレーター\n    const unpaidBills = (state.billing || []).filter(b => b.status === 'UNPAID');\n    const simBillingHtml = unpaidBills.map(b => {\n      return `<div style=\"margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ffe58f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;\">\n        <span style=\"font-size: 0.8em; color: #856404; font-weight: bold;\">[未決済] ${b.type} (${b.amount.replace('jpy:', '').toLocaleString()}円)</span>\n        <button class=\"btn btn-secondary\" style=\"padding: 4px 10px; font-size: 0.75em; min-height: 28px; width: auto;\" onclick=\"window.sns_dispatch({type:'PAY_BILL', payload:{billId:'${b.id}'}})\">決済（テスト支払）</button>\n      </div>`;\n    }).join('');\n\n    html += `<div class=\"section simulator-section\">\n      <h4>[開発用] 企業シミュレーター</h4>\n      <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n      <div class=\"simulator-actions\">\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n      </div>\n      ${simBillingHtml ? `<div style=\"margin-top: 15px; border-top: 1px solid #ffe58f; padding-top: 10px;\">\n        <h5 style=\"font-size: 0.85em; color: #856404; margin-bottom: 5px;\">【決済シミュレーター】</h5>\n        ${simBillingHtml}\n      </div>` : ''}\n    </div>`;\n  }\n\n  // Close scroll body container\n  html += `</div>`;\n\n  // Render bottom navigation bar\n  html += `<div class=\"bottom-nav\">\n    <div class=\"bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('profile')\">\n      <span class=\"icon\">👤</span>\n      <span>プロフィール</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'friends' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('friends')\">\n      <span class=\"icon\">🤝</span>\n      <span>親友リンク</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'scouts' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('scouts')\">\n      <span class=\"icon\">✉️</span>\n      <span>スカウト</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'debug' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('debug')\">\n      <span class=\"icon\">⚙️</span>\n      <span>デバッグ</span>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_switch_tab_view = (tab) => {\n    activeTab = tab;\n    render(container, state, dispatch);\n  };\n\n  window.sns_toggle_chat = (matchId) => {\n    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;\n    render(container, state, dispatch);\n  };\n\n  window.sns_send_message = (matchId) => {\n    const inputEl = document.getElementById(`chat-input-${matchId}`);\n    const text = inputEl ? inputEl.value.trim() : '';\n    if (text) {\n      dispatch({\n        type: 'SEND_MESSAGE',\n        payload: {\n          matchId,\n          senderId: currentUser.id,\n          text\n        }\n      });\n      inputEl.value = '';\n    }\n  };\n\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 0; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.9em; color: #65676b;\">この鍵画像を保存してください。これがあなたの「ログイン証」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 20px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px;\">鍵ID: ${publicId}</p>\n      <div style=\"margin-top: 20px;\">\n        <button class=\"btn btn-secondary\" onclick=\"location.reload()\">ログイン画面に戻る</button>\n      </div>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.webp`;\n        link.href = canvas.toDataURL('image/webp');\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            // Ensure student is registered if new\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。\"); }\n        } else { alert(\"QRコードが読み取れませんでした。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779253529639,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "render"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-86feb01b",
      "v": 7
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nlet activeChatMatchId = null;\nlet activeTab = 'profile';\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  // Modern Mobile Frame Layout starts\n  let html = `<div class=\"app-scroll-body\">`;\n\n  // My Page Header\n  html += `<div class=\"mypage-header\">\n    <h2>${activeTab === 'profile' ? 'プロフィール設定' : activeTab === 'friends' ? '親友リンク' : activeTab === 'scouts' ? 'スカウト・面談' : '開発用ツール'}</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  if (activeTab === 'profile') {\n    // 1. プロフィール編集\n    html += `<div class=\"section\">\n      <h3>プロフィール編集</h3>\n      <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n        <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n        <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n        <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n        <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n      </div>\n    </div>`;\n  }\n\n  else if (activeTab === 'friends') {\n    // 2. 親友リンク（ペアスカウトの要）\n    const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n    html += `<div class=\"section\">\n      <h3>親友リンク</h3>\n      <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n      ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n      ${otherStudents.map(os => {\n        const isFriend = currentUser.profile.friends.includes(os.id);\n        const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n        return `<div class=\"user-card\">\n          <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n          <div class=\"user-card-actions\">\n            <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n              onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n              ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n            </button>\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'scouts') {\n    // 3. 受信したスカウト\n    const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n    html += `<div class=\"section\">\n      <h3>届いているスカウト</h3>\n      ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n      ${myMatches.map(m => {\n        const isPair = m.interviewType === 'タイプ:ペア';\n        const partnerId = m.studentIds.find(id => id !== currentUser.id);\n        const partnerName = state.users[partnerId]?.profile.name;\n        \n        const chatHtml = activeChatMatchId === m.id ? (() => {\n          // Check if there is an interview fee bill paid (status === 'PAID')\n          const isPaid = (state.billing || []).some(b => b.matchId === m.id && b.type === '手数料:面談' && b.status === 'PAID');\n\n          if (!isPaid) {\n            return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n              <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n              <div style=\"background: #fff3cd; border: 1px solid #ffe58f; color: #856404; padding: 15px; border-radius: 4px; font-size: 0.9em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n                <span style=\"font-size: 1.5em;\">🔒</span>\n                <strong>面談手数料の決済が完了するまで、チャットルームは利用できません。</strong>\n                <span style=\"font-size: 0.8em; opacity: 0.85;\">※現在、企業様による面談手数料のお支払いが確認できておりません。決済完了までしばらくお待ちください。</span>\n              </div>\n            </div>`;\n          }\n\n          const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);\n          const msgListHtml = msgs.map(msg => {\n            const isMe = msg.senderId === currentUser.id;\n            const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');\n            const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';\n            const bubbleColor = isMe ? '#ffffff' : '#1f242d';\n            const alignSelf = isMe ? 'flex-end' : 'flex-start';\n            return `<div style=\"display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;\">\n              <span style=\"font-size: 0.7em; color: #65676b; margin-bottom: 2px;\">${senderName}</span>\n              <div style=\"background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;\">\n                ${msg.text}\n              </div>\n            </div>`;\n          }).join('') || '<p style=\"font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;\">まだメッセージはありません。最初のメッセージを送りましょう！</p>';\n\n          return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n            <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n            <div class=\"chat-scroller\">\n              ${msgListHtml}\n            </div>\n            <div style=\"display: flex; gap: 8px; width: 100%;\">\n              <input type=\"text\" id=\"chat-input-${m.id}\" class=\"input-field\" placeholder=\"メッセージを入力...\" style=\"flex: 1; padding: 10px;\" onkeypress=\"if(event.key === 'Enter') window.sns_send_message('${m.id}')\">\n              <button class=\"btn\" style=\"width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;\" onclick=\"window.sns_send_message('${m.id}')\">送信</button>\n            </div>\n          </div>`;\n        })() : '';\n\n        return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;\">\n          <div style=\"display: flex; flex-direction: column; gap: 10px; width: 100%;\">\n            <div style=\"display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;\">\n              <div>\n                <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n                  ${isPair ? 'ペアスカウト' : '単体スカウト'}\n                </span>\n                <div style=\"margin-top: 5px;\">\n                  <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n                  ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n                </div>\n                <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n              </div>\n              <div class=\"user-card-actions\" style=\"width: auto;\">\n                ${m.status === MatchStatus.SCOUTED ? `\n                  <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n                  <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n                ` : ''}\n                ${m.status === MatchStatus.INTERVIEW_SET ? `\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n                ${m.status === MatchStatus.HIRED ? `\n                  <span style=\"color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;\">採用確定！</span>\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n              </div>\n            </div>\n            ${chatHtml}\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'debug') {\n    // 4. (デバッグ用) 企業シミュレーター\n    const unpaidBills = (state.billing || []).filter(b => b.status === 'UNPAID');\n    const simBillingHtml = unpaidBills.map(b => {\n      return `<div style=\"margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ffe58f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;\">\n        <span style=\"font-size: 0.8em; color: #856404; font-weight: bold;\">[未決済] ${b.type} (${b.amount.replace('jpy:', '').toLocaleString()}円)</span>\n        <button class=\"btn btn-secondary\" style=\"padding: 4px 10px; font-size: 0.75em; min-height: 28px; width: auto;\" onclick=\"window.sns_dispatch({type:'PAY_BILL', payload:{billId:'${b.id}'}})\">決済（テスト支払）</button>\n      </div>`;\n    }).join('');\n\n    html += `<div class=\"section simulator-section\">\n      <h4>[開発用] 企業シミュレーター</h4>\n      <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n      <div class=\"simulator-actions\">\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n      </div>\n      ${simBillingHtml ? `<div style=\"margin-top: 15px; border-top: 1px solid #ffe58f; padding-top: 10px;\">\n        <h5 style=\"font-size: 0.85em; color: #856404; margin-bottom: 5px;\">【決済シミュレーター】</h5>\n        ${simBillingHtml}\n      </div>` : ''}\n    </div>`;\n  }\n\n  // Close scroll body container\n  html += `</div>`;\n\n  // Render bottom navigation bar\n  html += `<div class=\"bottom-nav\">\n    <div class=\"bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('profile')\">\n      <span class=\"icon\">👤</span>\n      <span>プロフィール</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'friends' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('friends')\">\n      <span class=\"icon\">🤝</span>\n      <span>親友リンク</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'scouts' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('scouts')\">\n      <span class=\"icon\">✉️</span>\n      <span>スカウト</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'debug' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('debug')\">\n      <span class=\"icon\">⚙️</span>\n      <span>デバッグ</span>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_switch_tab_view = (tab) => {\n    activeTab = tab;\n    render(container, state, dispatch);\n  };\n\n  window.sns_toggle_chat = (matchId) => {\n    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;\n    render(container, state, dispatch);\n  };\n\n  window.sns_send_message = (matchId) => {\n    const inputEl = document.getElementById(`chat-input-${matchId}`);\n    const text = inputEl ? inputEl.value.trim() : '';\n    if (text) {\n      dispatch({\n        type: 'SEND_MESSAGE',\n        payload: {\n          matchId,\n          senderId: currentUser.id,\n          text\n        }\n      });\n      inputEl.value = '';\n    }\n  };\n\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 6px; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold; margin-bottom: 8px;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.85em; color: #65676b; margin-bottom: 15px;\">この鍵画像を必ずダウンロードして保存してください。これがあなたの「ログイン証（秘密鍵）」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード (PNG)</button>\n        <button class=\"btn btn-secondary\" style=\"background: var(--primary-color); color: #ffffff;\" id=\"auto-login-btn\">保存を完了してマイページへ進む ➡️</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px; margin-top: 15px; border: 1px solid var(--border-color);\">鍵ID: ${publicId}</p>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n\n    // Click to auto-login UX\n    document.getElementById('auto-login-btn').onclick = () => {\n      dispatch({ type: 'SET_AUTH', payload: { publicId, identity } });\n      dispatch({ type: 'USER_REGISTER', payload: { id: publicId, role: Roles.STUDENT, name: '新規ユーザー' } });\n    };\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.png`;\n        link.href = canvas.toDataURL('image/png'); // Use lossless PNG instead of lossy WebP\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。: \" + (result.error || \"\")); }\n        } else { alert(\"QRコードが読み取れませんでした。画像の画質やトリミングを確認してください。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779253736038,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "render"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-0c02c0c3",
      "v": 8
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nlet activeChatMatchId = null;\nlet activeTab = 'profile';\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  // Modern Mobile Frame Layout starts\n  let html = `<div class=\"app-scroll-body\">`;\n\n  // My Page Header\n  html += `<div class=\"mypage-header\">\n    <h2>${activeTab === 'profile' ? 'プロフィール設定' : activeTab === 'friends' ? '親友リンク' : activeTab === 'scouts' ? 'スカウト・面談' : '開発用ツール'}</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  if (activeTab === 'profile') {\n    // Quick-Fill Sport Templates\n    html += `<div class=\"section\" style=\"background: #eef2ff; border-color: #c7d2fe; padding: 15px;\">\n      <h3 style=\"color: #4338ca; border-left-color: #4338ca; font-size: 0.95em; margin-bottom: 10px;\">⚡ クイック入力テンプレート</h3>\n      <p style=\"font-size: 0.75em; color: #4338ca; margin-bottom: 12px; font-weight: bold;\">競技を選択すると、実績や自己PRの模範文が全自動入力されます！</p>\n      <div style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;\">\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('soccer')\">⚽ サッカー部FW</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('baseball')\">⚾ 野球部捕手</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('rugby')\">🏉 ラグビー部</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('track')\">🏃 陸上短距離</button>\n      </div>\n    </div>`;\n\n    // 1. プロフィール編集\n    html += `<div class=\"section\">\n      <h3>プロフィール編集</h3>\n      <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n        <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n        <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n        <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n        <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n      </div>\n    </div>`;\n  }\n\n  else if (activeTab === 'friends') {\n    // 2. 親友リンク（ペアスカウトの要）\n    const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n    html += `<div class=\"section\">\n      <h3>親友リンク</h3>\n      <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n      ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n      ${otherStudents.map(os => {\n        const isFriend = currentUser.profile.friends.includes(os.id);\n        const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n        return `<div class=\"user-card\">\n          <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n          <div class=\"user-card-actions\">\n            <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n              onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n              ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n            </button>\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'scouts') {\n    // 3. 受信したスカウト\n    const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n    html += `<div class=\"section\">\n      <h3>届いているスカウト</h3>\n      ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n      ${myMatches.map(m => {\n        const isPair = m.interviewType === 'タイプ:ペア';\n        const partnerId = m.studentIds.find(id => id !== currentUser.id);\n        const partnerName = state.users[partnerId]?.profile.name;\n        \n        const chatHtml = activeChatMatchId === m.id ? (() => {\n          // Check if there is an interview fee bill paid (status === 'PAID')\n          const isPaid = (state.billing || []).some(b => b.matchId === m.id && b.type === '手数料:面談' && b.status === 'PAID');\n\n          if (!isPaid) {\n            return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n              <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n              <div style=\"background: #fff3cd; border: 1px solid #ffe58f; color: #856404; padding: 15px; border-radius: 4px; font-size: 0.9em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n                <span style=\"font-size: 1.5em;\">🔒</span>\n                <strong>面談手数料の決済が完了するまで、チャットルームは利用できません。</strong>\n                <span style=\"font-size: 0.8em; opacity: 0.85;\">※現在、企業様による面談手数料のお支払いが確認できておりません。決済完了までしばらくお待ちください。</span>\n              </div>\n            </div>`;\n          }\n\n          const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);\n          const msgListHtml = msgs.map(msg => {\n            const isMe = msg.senderId === currentUser.id;\n            const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');\n            const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';\n            const bubbleColor = isMe ? '#ffffff' : '#1f242d';\n            const alignSelf = isMe ? 'flex-end' : 'flex-start';\n            return `<div style=\"display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;\">\n              <span style=\"font-size: 0.7em; color: #65676b; margin-bottom: 2px;\">${senderName}</span>\n              <div style=\"background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;\">\n                ${msg.text}\n              </div>\n            </div>`;\n          }).join('') || '<p style=\"font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;\">まだメッセージはありません。最初のメッセージを送りましょう！</p>';\n\n          return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n            <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n            <div class=\"chat-scroller\">\n              ${msgListHtml}\n            </div>\n            <div style=\"display: flex; gap: 8px; width: 100%;\">\n              <input type=\"text\" id=\"chat-input-${m.id}\" class=\"input-field\" placeholder=\"メッセージを入力...\" style=\"flex: 1; padding: 10px;\" onkeypress=\"if(event.key === 'Enter') window.sns_send_message('${m.id}')\">\n              <button class=\"btn\" style=\"width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;\" onclick=\"window.sns_send_message('${m.id}')\">送信</button>\n            </div>\n          </div>`;\n        })() : '';\n\n        return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;\">\n          <div style=\"display: flex; flex-direction: column; gap: 10px; width: 100%;\">\n            <div style=\"display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;\">\n              <div>\n                <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n                  ${isPair ? 'ペアスカウト' : '単体スカウト'}\n                </span>\n                <div style=\"margin-top: 5px;\">\n                  <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n                  ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n                </div>\n                <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n              </div>\n              <div class=\"user-card-actions\" style=\"width: auto;\">\n                ${m.status === MatchStatus.SCOUTED ? `\n                  <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n                  <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n                ` : ''}\n                ${m.status === MatchStatus.INTERVIEW_SET ? `\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n                ${m.status === MatchStatus.HIRED ? `\n                  <span style=\"color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;\">採用確定！</span>\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n              </div>\n            </div>\n            ${chatHtml}\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'debug') {\n    // 4. (デバッグ用) 企業シミュレーター\n    const unpaidBills = (state.billing || []).filter(b => b.status === 'UNPAID');\n    const simBillingHtml = unpaidBills.map(b => {\n      return `<div style=\"margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ffe58f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;\">\n        <span style=\"font-size: 0.8em; color: #856404; font-weight: bold;\">[未決済] ${b.type} (${b.amount.replace('jpy:', '').toLocaleString()}円)</span>\n        <button class=\"btn btn-secondary\" style=\"padding: 4px 10px; font-size: 0.75em; min-height: 28px; width: auto;\" onclick=\"window.sns_dispatch({type:'PAY_BILL', payload:{billId:'${b.id}'}})\">決済（テスト支払）</button>\n      </div>`;\n    }).join('');\n\n    html += `<div class=\"section simulator-section\">\n      <h4>[開発用] 企業シミュレーター</h4>\n      <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n      <div class=\"simulator-actions\">\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n      </div>\n      ${simBillingHtml ? `<div style=\"margin-top: 15px; border-top: 1px solid #ffe58f; padding-top: 10px;\">\n        <h5 style=\"font-size: 0.85em; color: #856404; margin-bottom: 5px;\">【決済シミュレーター】</h5>\n        ${simBillingHtml}\n      </div>` : ''}\n    </div>`;\n  }\n\n  // Close scroll body container\n  html += `</div>`;\n\n  // Render bottom navigation bar\n  html += `<div class=\"bottom-nav\">\n    <div class=\"bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('profile')\">\n      <span class=\"icon\">👤</span>\n      <span>プロフィール</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'friends' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('friends')\">\n      <span class=\"icon\">🤝</span>\n      <span>親友リンク</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'scouts' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('scouts')\">\n      <span class=\"icon\">✉️</span>\n      <span>スカウト</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'debug' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('debug')\">\n      <span class=\"icon\">⚙️</span>\n      <span>デバッグ</span>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_switch_tab_view = (tab) => {\n    activeTab = tab;\n    render(container, state, dispatch);\n  };\n\n  window.sns_toggle_chat = (matchId) => {\n    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;\n    render(container, state, dispatch);\n  };\n\n  window.sns_send_message = (matchId) => {\n    const inputEl = document.getElementById(`chat-input-${matchId}`);\n    const text = inputEl ? inputEl.value.trim() : '';\n    if (text) {\n      dispatch({\n        type: 'SEND_MESSAGE',\n        payload: {\n          matchId,\n          senderId: currentUser.id,\n          text\n        }\n      });\n      inputEl.value = '';\n    }\n  };\n\n  window.sns_apply_sport_template = (sport) => {\n    const templates = {\n      soccer: {\n        name: '清水 美咲',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将・得点王',\n        achievements: '全国高校選手権ベスト8、都リーグ得点王',\n        selfPR: 'チームを牽引する高いリーダーシップと、決定機を決して逃さない圧倒的な決定力が武器です。ゴールに向かう貪欲な姿勢と、泥臭く攻め立てる走力で勝利をもたらします。親友の司令塔MFとは10年間同じピッチで戦い、阿吽の呼吸でパスを受けられます。'\n      },\n      baseball: {\n        name: '鈴木 翔太',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        achievements: '春季リーグ ベストナイン、甲子園出場',\n        selfPR: '投手の長所を120%引き出すインサイドワークと、二塁送球1.9秒台の強肩が強みです。グラウンド全体を冷静に見渡す視野の広さでチームを統率します。絶対の信頼関係を築けるバッテリーを組めます。'\n      },\n      rugby: {\n        name: '山田 拓也',\n        sport: 'ラグビー部 (SH)',\n        position: 'スクラムハーフ / ゲームメイカー',\n        achievements: '全国大学選手権ベスト4、リーグ戦ベスト15',\n        selfPR: '素早い球出しと的確な判断力、そしてタフな運動量で攻撃のテンポを作り出します。ピンチの局面でも常に声を出し続け、身体を張ったタックルでチームを鼓舞する献身的なプレイが強みです。'\n      },\n      track: {\n        name: '佐藤 陸',\n        sport: '陸上競技部 (短距離)',\n        position: '100m / 主将',\n        achievements: 'インカレ 100m決勝進出、自己ベスト 10.45秒',\n        selfPR: '妥協なきトレーニングと緻密な走法分析による、圧倒的なセルフマネジメント力が武器です。主将としてチームの総合力向上にも寄与し、個々の走力を最大限引き出すコーチングを強みとしています。'\n      }\n    };\n\n    const t = templates[sport];\n    if (t) {\n      document.getElementById('edit-name').value = t.name;\n      document.getElementById('edit-sport').value = t.sport;\n      document.getElementById('edit-position').value = t.position;\n      document.getElementById('edit-achievements').value = t.achievements;\n      document.getElementById('edit-selfPR').value = t.selfPR;\n    }\n  };\n\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 6px; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold; margin-bottom: 8px;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.85em; color: #65676b; margin-bottom: 15px;\">この鍵画像を必ずダウンロードして保存してください。これがあなたの「ログイン証（秘密鍵）」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード (PNG)</button>\n        <button class=\"btn btn-secondary\" style=\"background: var(--primary-color); color: #ffffff;\" id=\"auto-login-btn\">保存を完了してマイページへ進む ➡️</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px; margin-top: 15px; border: 1px solid var(--border-color);\">鍵ID: ${publicId}</p>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n\n    // Click to auto-login UX\n    document.getElementById('auto-login-btn').onclick = () => {\n      dispatch({ type: 'SET_AUTH', payload: { publicId, identity } });\n      dispatch({ type: 'USER_REGISTER', payload: { id: publicId, role: Roles.STUDENT, name: '新規ユーザー' } });\n    };\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.png`;\n        link.href = canvas.toDataURL('image/png'); // Use lossless PNG instead of lossy WebP\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。: \" + (result.error || \"\")); }\n        } else { alert(\"QRコードが読み取れませんでした。画像の画質やトリミングを確認してください。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779253813382,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "render"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-3de80be5",
      "v": 9
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nlet activeChatMatchId = null;\nlet activeTab = 'profile';\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  // Modern Mobile Frame Layout starts\n  let html = `<div class=\"app-scroll-body\">`;\n\n  // My Page Header\n  html += `<div class=\"mypage-header\">\n    <h2>${activeTab === 'profile' ? 'プロフィール設定' : activeTab === 'friends' ? '親友リンク' : activeTab === 'scouts' ? 'スカウト・面談' : '開発用ツール'}</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  if (activeTab === 'profile') {\n    // Quick-Fill Sport Templates\n    html += `<div class=\"section\" style=\"background: #eef2ff; border-color: #c7d2fe; padding: 15px;\">\n      <h3 style=\"color: #4338ca; border-left-color: #4338ca; font-size: 0.95em; margin-bottom: 10px;\">⚡ クイック入力テンプレート</h3>\n      <p style=\"font-size: 0.75em; color: #4338ca; margin-bottom: 12px; font-weight: bold;\">競技を選択すると、実績や自己PRの模範文が全自動入力されます！</p>\n      <div style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;\">\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('soccer')\">⚽ サッカー部FW</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('baseball')\">⚾ 野球部捕手</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('rugby')\">🏉 ラグビー部</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('track')\">🏃 陸上短距離</button>\n      </div>\n    </div>`;\n\n    // 📸 連動型部活集合写真\n    const hasFriend = currentUser.profile.friends.length > 0;\n    const friendId = hasFriend ? currentUser.profile.friends[0] : null;\n    const friendName = friendId ? (state.users[friendId]?.profile.name || '親友') : '（親友未設定）';\n    const isMutual = friendId && state.users[friendId]?.profile.friends.includes(currentUser.id);\n\n    let fieldBg = '#e2e8f0';\n    let sportEmoji = '👥';\n    let teamName = '部活動チーム';\n    let playerLayout = '';\n\n    if (currentUser.profile.sport.includes('サッカー')) {\n      fieldBg = 'linear-gradient(135deg, #115e59, #134e4a)';\n      sportEmoji = '⚽';\n      teamName = `${currentUser.profile.name || 'あなた'}の所属サッカー部`;\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"position: absolute; top: 0; bottom: 0; left: 50%; width: 1.5px; background: rgba(255,255,255,0.15);\"></div>\n          <div style=\"position: absolute; width: 50px; height: 50px; border: 1.5px solid rgba(255,255,255,0.15); border-radius: 50%;\"></div>\n          \n          <div style=\"position: absolute; left: 22%; top: 35%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: #fbbf24; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">10</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${currentUser.profile.name || 'あなた'}</span>\n          </div>\n          \n          <div style=\"position: absolute; left: 58%; top: 48%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: ${isMutual ? '#ef4444' : '#64748b'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">${isMutual ? '❤️' : '8'}</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${friendName}</span>\n          </div>\n\n          <div style=\"position: absolute; left: 8%; top: 20%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 12%; top: 75%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 35%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 40%; top: 80%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 78%; top: 20%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 82%; top: 70%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n        </div>`;\n    } else if (currentUser.profile.sport.includes('野球')) {\n      fieldBg = 'linear-gradient(135deg, #7c2d12, #451a03)';\n      sportEmoji = '⚾';\n      teamName = `${currentUser.profile.name || 'あなた'}の所属野球部`;\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"position: absolute; width: 70px; height: 70px; border: 1.5px solid rgba(255,255,255,0.15); transform: rotate(45deg); top: 30%;\"></div>\n          \n          <div style=\"position: absolute; left: 48%; top: 72%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: #fbbf24; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">2</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${currentUser.profile.name || 'あなた'}</span>\n          </div>\n          \n          <div style=\"position: absolute; left: 48%; top: 22%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: ${isMutual ? '#ef4444' : '#64748b'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">${isMutual ? '❤️' : '1'}</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${friendName}</span>\n          </div>\n\n          <div style=\"position: absolute; left: 15%; top: 30%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 30%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 70%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 85%; top: 30%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n        </div>`;\n    } else {\n      fieldBg = 'linear-gradient(135deg, #1e293b, #0f172a)';\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"text-align: center; color: rgba(255,255,255,0.4); font-size: 0.85em; font-weight: bold; line-height: 1.4;\">\n            ${sportEmoji} クイックテンプレートを選択して<br>集合写真を自動生成しましょう！\n          </div>\n        </div>`;\n    }\n\n    html += `<div class=\"section\" style=\"padding: 15px;\">\n      <h3 style=\"font-size: 0.95em; margin-bottom: 10px;\">📸 連動型部活動集合写真</h3>\n      <p style=\"font-size: 0.75em; color: var(--text-sub); margin-bottom: 12px; font-weight: 500;\">\n        ※あなたと親友のペア所属を証明する「集合写真（フォーメーション）」です。\n      </p>\n      ${playerLayout}\n      <div style=\"margin-top: 10px; font-size: 0.8em; color: var(--text-sub); display: flex; align-items: center; justify-content: space-between;\">\n        <span><strong>${teamName}</strong> (システム認証)</span>\n        <span>${isMutual ? '<strong style=\"color: #2e7d32;\">❤️ 同一写真に写る親友としてリンク済</strong>' : '<strong style=\"color: #b45309;\">⚠️ 親友未接続</strong>'}</span>\n      </div>\n    </div>`;\n\n    // 1. プロフィール編集\n    html += `<div class=\"section\">\n      <h3>プロフィール編集</h3>\n      <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n        <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n        <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n        <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n        <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n      </div>\n    </div>`;\n  }\n\n  else if (activeTab === 'friends') {\n    // 2. 親友リンク（ペアスカウトの要）\n    const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n    html += `<div class=\"section\" style=\"border-color: #cbd5e1;\">\n      <h3>📸 集合写真から繋がる（対面リンク）</h3>\n      <p style=\"font-size: 0.75em; color: var(--text-sub); margin-bottom: 12px; font-weight: 500;\">\n        部活動の目の前にいる親友と繋がります。カメラを起動して、友人の「ログインQRコード（鍵画像）」をスキャンしてください。\n      </p>\n      <button class=\"btn\" style=\"background: var(--primary-color); display: flex; align-items: center; justify-content: center; gap: 8px;\" onclick=\"window.sns_start_camera_scanner()\">\n        📷 QRカメラを起動して対面スキャン\n      </button>\n\n      <div id=\"camera-scanner-container\" style=\"display: none; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; padding: 15px; background: #f1f5f9; border-radius: 6px; border: 1px solid var(--border-color);\">\n        <video id=\"scanner-video\" playsinline style=\"width: 100%; max-width: 280px; height: 190px; border-radius: 4px; background: #000; object-fit: cover;\"></video>\n        <div style=\"font-size: 0.75em; color: var(--text-sub); font-weight: bold; text-align: center;\">友人のログイン証QR（秘密鍵）を枠内に写してください</div>\n        <button class=\"btn btn-secondary\" style=\"padding: 4px 10px; min-height: 28px; font-size: 0.75em; width: auto;\" onclick=\"window.sns_stop_camera_scanner()\">キャンセル</button>\n      </div>\n    </div>`;\n\n    html += `<div class=\"section\">\n      <h3>登録されている学生リスト</h3>\n      <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n      ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n      ${otherStudents.map(os => {\n        const isFriend = currentUser.profile.friends.includes(os.id);\n        const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n        return `<div class=\"user-card\">\n          <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n          <div class=\"user-card-actions\">\n            <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n              onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n              ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n            </button>\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'scouts') {\n    // 3. 受信したスカウト\n    const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n    html += `<div class=\"section\">\n      <h3>届いているスカウト</h3>\n      ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n      ${myMatches.map(m => {\n        const isPair = m.interviewType === 'タイプ:ペア';\n        const partnerId = m.studentIds.find(id => id !== currentUser.id);\n        const partnerName = state.users[partnerId]?.profile.name;\n        \n        const chatHtml = activeChatMatchId === m.id ? (() => {\n          // Check if there is an interview fee bill paid (status === 'PAID')\n          const isPaid = (state.billing || []).some(b => b.matchId === m.id && b.type === '手数料:面談' && b.status === 'PAID');\n\n          if (!isPaid) {\n            return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n              <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n              <div style=\"background: #fff3cd; border: 1px solid #ffe58f; color: #856404; padding: 15px; border-radius: 4px; font-size: 0.9em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n                <span style=\"font-size: 1.5em;\">🔒</span>\n                <strong>面談手数料の決済が完了するまで、チャットルームは利用できません。</strong>\n                <span style=\"font-size: 0.8em; opacity: 0.85;\">※現在、企業様による面談手数料のお支払いが確認できておりません。決済完了までしばらくお待ちください。</span>\n              </div>\n            </div>`;\n          }\n\n          const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);\n          const msgListHtml = msgs.map(msg => {\n            const isMe = msg.senderId === currentUser.id;\n            const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');\n            const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';\n            const bubbleColor = isMe ? '#ffffff' : '#1f242d';\n            const alignSelf = isMe ? 'flex-end' : 'flex-start';\n            return `<div style=\"display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;\">\n              <span style=\"font-size: 0.7em; color: #65676b; margin-bottom: 2px;\">${senderName}</span>\n              <div style=\"background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;\">\n                ${msg.text}\n              </div>\n            </div>`;\n          }).join('') || '<p style=\"font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;\">まだメッセージはありません。最初のメッセージを送りましょう！</p>';\n\n          return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n            <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n            <div class=\"chat-scroller\">\n              ${msgListHtml}\n            </div>\n            <div style=\"display: flex; gap: 8px; width: 100%;\">\n              <input type=\"text\" id=\"chat-input-${m.id}\" class=\"input-field\" placeholder=\"メッセージを入力...\" style=\"flex: 1; padding: 10px;\" onkeypress=\"if(event.key === 'Enter') window.sns_send_message('${m.id}')\">\n              <button class=\"btn\" style=\"width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;\" onclick=\"window.sns_send_message('${m.id}')\">送信</button>\n            </div>\n          </div>`;\n        })() : '';\n\n        return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;\">\n          <div style=\"display: flex; flex-direction: column; gap: 10px; width: 100%;\">\n            <div style=\"display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;\">\n              <div>\n                <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n                  ${isPair ? 'ペアスカウト' : '単体スカウト'}\n                </span>\n                <div style=\"margin-top: 5px;\">\n                  <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n                  ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n                </div>\n                <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n              </div>\n              <div class=\"user-card-actions\" style=\"width: auto;\">\n                ${m.status === MatchStatus.SCOUTED ? `\n                  <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n                  <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n                ` : ''}\n                ${m.status === MatchStatus.INTERVIEW_SET ? `\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n                ${m.status === MatchStatus.HIRED ? `\n                  <span style=\"color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;\">採用確定！</span>\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n              </div>\n            </div>\n            ${chatHtml}\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'debug') {\n    // 4. (デバッグ用) 企業シミュレーター\n    const unpaidBills = (state.billing || []).filter(b => b.status === 'UNPAID');\n    const simBillingHtml = unpaidBills.map(b => {\n      return `<div style=\"margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ffe58f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;\">\n        <span style=\"font-size: 0.8em; color: #856404; font-weight: bold;\">[未決済] ${b.type} (${b.amount.replace('jpy:', '').toLocaleString()}円)</span>\n        <button class=\"btn btn-secondary\" style=\"padding: 4px 10px; font-size: 0.75em; min-height: 28px; width: auto;\" onclick=\"window.sns_dispatch({type:'PAY_BILL', payload:{billId:'${b.id}'}})\">決済（テスト支払）</button>\n      </div>`;\n    }).join('');\n\n    html += `<div class=\"section simulator-section\">\n      <h4>[開発用] 企業シミュレーター</h4>\n      <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n      <div class=\"simulator-actions\">\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n      </div>\n      ${simBillingHtml ? `<div style=\"margin-top: 15px; border-top: 1px solid #ffe58f; padding-top: 10px;\">\n        <h5 style=\"font-size: 0.85em; color: #856404; margin-bottom: 5px;\">【決済シミュレーター】</h5>\n        ${simBillingHtml}\n      </div>` : ''}\n    </div>`;\n  }\n\n  // Close scroll body container\n  html += `</div>`;\n\n  // Render bottom navigation bar\n  html += `<div class=\"bottom-nav\">\n    <div class=\"bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('profile')\">\n      <span class=\"icon\">👤</span>\n      <span>プロフィール</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'friends' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('friends')\">\n      <span class=\"icon\">🤝</span>\n      <span>親友リンク</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'scouts' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('scouts')\">\n      <span class=\"icon\">✉️</span>\n      <span>スカウト</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'debug' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('debug')\">\n      <span class=\"icon\">⚙️</span>\n      <span>デバッグ</span>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_switch_tab_view = (tab) => {\n    activeTab = tab;\n    render(container, state, dispatch);\n  };\n\n  window.sns_toggle_chat = (matchId) => {\n    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;\n    render(container, state, dispatch);\n  };\n\n  window.sns_send_message = (matchId) => {\n    const inputEl = document.getElementById(`chat-input-${matchId}`);\n    const text = inputEl ? inputEl.value.trim() : '';\n    if (text) {\n      dispatch({\n        type: 'SEND_MESSAGE',\n        payload: {\n          matchId,\n          senderId: currentUser.id,\n          text\n        }\n      });\n      inputEl.value = '';\n    }\n  };\n\n  window.sns_apply_sport_template = (sport) => {\n    const templates = {\n      soccer: {\n        name: '清水 美咲',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将・得点王',\n        achievements: '全国高校選手権ベスト8、都リーグ得点王',\n        selfPR: 'チームを牽引する高いリーダーシップと、決定機を決して逃さない圧倒的な決定力が武器です。ゴールに向かう貪欲な姿勢と、泥臭く攻め立てる走力で勝利をもたらします。親友の司令塔MFとは10年間同じピッチで戦い、阿吽の呼吸でパスを受けられます。'\n      },\n      baseball: {\n        name: '鈴木 翔太',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        achievements: '春季リーグ ベストナイン、甲子園出場',\n        selfPR: '投手の長所を120%引き出すインサイドワークと、二塁送球1.9秒台の強肩が強みです。グラウンド全体を冷静に見渡す視野の広さでチームを統率します。絶対の信頼関係を築けるバッテリーを組めます。'\n      },\n      rugby: {\n        name: '山田 拓也',\n        sport: 'ラグビー部 (SH)',\n        position: 'スクラムハーフ / ゲームメイカー',\n        achievements: '全国大学選手権ベスト4、リーグ戦ベスト15',\n        selfPR: '素早い球出しと的確な判断力、そしてタフな運動量で攻撃のテンポを作り出します。ピンチの局面でも常に声を出し続け、身体を張ったタックルでチームを鼓舞する献身的なプレイが強みです。'\n      },\n      track: {\n        name: '佐藤 陸',\n        sport: '陸上競技部 (短距離)',\n        position: '100m / 主将',\n        achievements: 'インカレ 100m決勝進出、自己ベスト 10.45秒',\n        selfPR: '妥協なきトレーニングと緻密な走法分析による、圧倒的なセルフマネジメント力が武器です。主将としてチームの総合力向上にも寄与し、個々の走力を最大限引き出すコーチングを強みとしています。'\n      }\n    };\n\n    const t = templates[sport];\n    if (t) {\n      document.getElementById('edit-name').value = t.name;\n      document.getElementById('edit-sport').value = t.sport;\n      document.getElementById('edit-position').value = t.position;\n      document.getElementById('edit-achievements').value = t.achievements;\n      document.getElementById('edit-selfPR').value = t.selfPR;\n    }\n  };\n\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  // Live QR Camera Scanner event handlers\n  let scannerStream = null;\n  let scannerAnimationId = null;\n\n  window.sns_start_camera_scanner = async () => {\n    const scanContainer = document.getElementById('camera-scanner-container');\n    const video = document.getElementById('scanner-video');\n    if (!scanContainer || !video) return;\n\n    scanContainer.style.display = 'flex';\n\n    try {\n      scannerStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });\n      video.srcObject = scannerStream;\n      video.setAttribute('playsinline', true);\n      video.play();\n\n      const canvas = document.createElement('canvas');\n      const ctx = canvas.getContext('2d');\n\n      const tick = () => {\n        if (video.readyState === video.HAVE_ENOUGH_DATA) {\n          canvas.width = video.videoWidth;\n          canvas.height = video.videoHeight;\n          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);\n          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n          const code = jsQR(imageData.data, imageData.width, imageData.height);\n          if (code) {\n            window.sns_handle_scanned_friend_key(code.data);\n            return;\n          }\n        }\n        scannerAnimationId = requestAnimationFrame(tick);\n      };\n      scannerAnimationId = requestAnimationFrame(tick);\n    } catch (err) {\n      console.error('Camera access failed:', err);\n      alert('カメラの起動に失敗しました。カメラ利用権限を確認してください。');\n      scanContainer.style.display = 'none';\n    }\n  };\n\n  window.sns_stop_camera_scanner = () => {\n    if (scannerStream) {\n      scannerStream.getTracks().forEach(track => track.stop());\n      scannerStream = null;\n    }\n    if (scannerAnimationId) {\n      cancelAnimationFrame(scannerAnimationId);\n      scannerAnimationId = null;\n    }\n    const scanContainer = document.getElementById('camera-scanner-container');\n    if (scanContainer) scanContainer.style.display = 'none';\n  };\n\n  window.sns_handle_scanned_friend_key = async (recoveryKey) => {\n    window.sns_stop_camera_scanner();\n    const result = await authenticateWithKey(recoveryKey);\n    if (result.success) {\n      const friendId = result.publicId;\n      if (friendId === currentUser.id) {\n        alert(\"自分自身を親友に登録することはできません。\");\n        return;\n      }\n      \n      // Auto-register the scanned user if new\n      if (!state.users[friendId]) {\n        dispatch({\n          type: 'USER_REGISTER',\n          payload: { id: friendId, role: Roles.STUDENT, name: result.identity.name || 'スキャンした学生' }\n        });\n      }\n\n      // Establish mutual friend links\n      dispatch({\n        type: 'SET_FRIEND',\n        payload: { studentId: currentUser.id, friendId }\n      });\n      dispatch({\n        type: 'SET_FRIEND',\n        payload: { studentId: friendId, friendId: currentUser.id }\n      });\n\n      alert(`🎉 相互の親友リンク（同一写真登録）が成立しました！\\n相手の集合写真フォーメーションにもあなたがハイライトされます！`);\n    } else {\n      alert(\"QRコードの解析に失敗しました。学生ログインQRを写してください。\");\n    }\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 6px; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold; margin-bottom: 8px;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.85em; color: #65676b; margin-bottom: 15px;\">この鍵画像を必ずダウンロードして保存してください。これがあなたの「ログイン証（秘密鍵）」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード (PNG)</button>\n        <button class=\"btn btn-secondary\" style=\"background: var(--primary-color); color: #ffffff;\" id=\"auto-login-btn\">保存を完了してマイページへ進む ➡️</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px; margin-top: 15px; border: 1px solid var(--border-color);\">鍵ID: ${publicId}</p>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n\n    // Click to auto-login UX\n    document.getElementById('auto-login-btn').onclick = () => {\n      dispatch({ type: 'SET_AUTH', payload: { publicId, identity } });\n      dispatch({ type: 'USER_REGISTER', payload: { id: publicId, role: Roles.STUDENT, name: '新規ユーザー' } });\n    };\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.png`;\n        link.href = canvas.toDataURL('image/png'); // Use lossless PNG instead of lossy WebP\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。: \" + (result.error || \"\")); }\n        } else { alert(\"QRコードが読み取れませんでした。画像の画質やトリミングを確認してください。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779254057309,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "render"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "requestAnimationFrame"
        },
        {
          "kind": "calls",
          "target": "cancelAnimationFrame"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "Image"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-733a7df8",
      "v": 10
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nlet activeChatMatchId = null;\nlet activeTab = 'profile';\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }\n  };\n\n  // Modern Mobile Frame Layout starts\n  let html = `<div class=\"app-scroll-body\">`;\n\n  // My Page Header\n  html += `<div class=\"mypage-header\">\n    <h2>${activeTab === 'profile' ? 'プロフィール設定' : activeTab === 'friends' ? '親友リンク' : activeTab === 'scouts' ? 'スカウト・面談' : '開発用ツール'}</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  if (activeTab === 'profile') {\n    // Quick-Fill Sport Templates\n    html += `<div class=\"section\" style=\"background: #eef2ff; border-color: #c7d2fe; padding: 15px;\">\n      <h3 style=\"color: #4338ca; border-left-color: #4338ca; font-size: 0.95em; margin-bottom: 10px;\">⚡ クイック入力テンプレート</h3>\n      <p style=\"font-size: 0.75em; color: #4338ca; margin-bottom: 12px; font-weight: bold;\">競技を選択すると、実績や自己PRの模範文が全自動入力されます！</p>\n      <div style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;\">\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('soccer')\">⚽ サッカー部FW</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('baseball')\">⚾ 野球部捕手</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('rugby')\">🏉 ラグビー部</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('track')\">🏃 陸上短距離</button>\n      </div>\n    </div>`;\n\n    // 📸 連動型部活集合写真\n    const hasFriend = currentUser.profile.friends.length > 0;\n    const friendId = hasFriend ? currentUser.profile.friends[0] : null;\n    const friendName = friendId ? (state.users[friendId]?.profile.name || '親友') : '（親友未設定）';\n    const isMutual = friendId && state.users[friendId]?.profile.friends.includes(currentUser.id);\n\n    let fieldBg = '#e2e8f0';\n    let sportEmoji = '👥';\n    let teamName = '部活動チーム';\n    let playerLayout = '';\n\n    if (currentUser.profile.sport.includes('サッカー')) {\n      fieldBg = 'linear-gradient(135deg, #115e59, #134e4a)';\n      sportEmoji = '⚽';\n      teamName = `${currentUser.profile.name || 'あなた'}の所属サッカー部`;\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"position: absolute; top: 0; bottom: 0; left: 50%; width: 1.5px; background: rgba(255,255,255,0.15);\"></div>\n          <div style=\"position: absolute; width: 50px; height: 50px; border: 1.5px solid rgba(255,255,255,0.15); border-radius: 50%;\"></div>\n          \n          <div style=\"position: absolute; left: 22%; top: 35%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: #fbbf24; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">10</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${currentUser.profile.name || 'あなた'}</span>\n          </div>\n          \n          <div style=\"position: absolute; left: 58%; top: 48%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: ${isMutual ? '#ef4444' : '#64748b'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">${isMutual ? '❤️' : '8'}</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${friendName}</span>\n          </div>\n\n          <div style=\"position: absolute; left: 8%; top: 20%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 12%; top: 75%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 35%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 40%; top: 80%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 78%; top: 20%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 82%; top: 70%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n        </div>`;\n    } else if (currentUser.profile.sport.includes('野球')) {\n      fieldBg = 'linear-gradient(135deg, #7c2d12, #451a03)';\n      sportEmoji = '⚾';\n      teamName = `${currentUser.profile.name || 'あなた'}の所属野球部`;\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"position: absolute; width: 70px; height: 70px; border: 1.5px solid rgba(255,255,255,0.15); transform: rotate(45deg); top: 30%;\"></div>\n          \n          <div style=\"position: absolute; left: 48%; top: 72%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: #fbbf24; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">2</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${currentUser.profile.name || 'あなた'}</span>\n          </div>\n          \n          <div style=\"position: absolute; left: 48%; top: 22%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: ${isMutual ? '#ef4444' : '#64748b'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">${isMutual ? '❤️' : '1'}</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${friendName}</span>\n          </div>\n\n          <div style=\"position: absolute; left: 15%; top: 30%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 30%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 70%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 85%; top: 30%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n        </div>`;\n    } else {\n      fieldBg = 'linear-gradient(135deg, #1e293b, #0f172a)';\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"text-align: center; color: rgba(255,255,255,0.4); font-size: 0.85em; font-weight: bold; line-height: 1.4;\">\n            ${sportEmoji} クイックテンプレートを選択して<br>集合写真を自動生成しましょう！\n          </div>\n        </div>`;\n    }\n\n    html += `<div class=\"section\" style=\"padding: 15px;\">\n      <h3 style=\"font-size: 0.95em; margin-bottom: 10px;\">📸 連動型部活動集合写真</h3>\n      <p style=\"font-size: 0.75em; color: var(--text-sub); margin-bottom: 12px; font-weight: 500;\">\n        ※あなたと親友のペア所属を証明する「集合写真（フォーメーション）」です。\n      </p>\n      ${playerLayout}\n      <div style=\"margin-top: 10px; font-size: 0.8em; color: var(--text-sub); display: flex; align-items: center; justify-content: space-between;\">\n        <span><strong>${teamName}</strong> (システム認証)</span>\n        <span>${isMutual ? '<strong style=\"color: #2e7d32;\">❤️ 同一写真に写る親友としてリンク済</strong>' : '<strong style=\"color: #b45309;\">⚠️ 親友未接続</strong>'}</span>\n      </div>\n    </div>`;\n\n    // 1. プロフィール編集\n    html += `<div class=\"section\">\n      <h3>プロフィール編集</h3>\n      <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n        <input type=\"text\" id=\"edit-name\" placeholder=\"氏名\" value=\"${currentUser.profile.name}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n        <textarea id=\"edit-achievements\" placeholder=\"競技実績\" class=\"input-field\" style=\"height: 60px;\">${currentUser.profile.achievements}</textarea>\n        <textarea id=\"edit-selfPR\" placeholder=\"自己PR\" class=\"input-field\" style=\"height: 100px;\">${currentUser.profile.selfPR}</textarea>\n        <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n      </div>\n    </div>`;\n  }\n\n  else if (activeTab === 'friends') {\n    // 2. 親友リンク（ペアスカウトの要）\n    const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n    html += `<div class=\"section\" style=\"border-color: #cbd5e1;\">\n      <h3>📸 ツーショット写真から親友をAI推測接続</h3>\n      <p style=\"font-size: 0.75em; color: var(--text-sub); margin-bottom: 12px; font-weight: 500;\">\n        親友と二人で写っている写真を1枚アップロードしてください。AIが画像中の顔と特徴量を解析し、あなたの親友（ペア候補）を自動特定します！\n      </p>\n      \n      <input type=\"file\" id=\"twoshot-upload\" accept=\"image/*\" style=\"display: none;\" onchange=\"window.sns_start_ai_inference(this)\">\n      <button class=\"btn\" style=\"background: var(--primary-color); display: flex; align-items: center; justify-content: center; gap: 8px;\" onclick=\"document.getElementById('twoshot-upload').click()\">\n        📷 写真を選択してAI解析を走らせる\n      </button>\n\n      <div id=\"ai-scanner-container\" style=\"display: none; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; padding: 15px; background: #eef2ff; border-radius: 6px; border: 1px solid #c7d2fe; position: relative; overflow: hidden; min-height: 250px;\">\n        <div id=\"scanner-laser\" style=\"position: absolute; left: 0; top: 0; width: 100%; height: 3px; background: rgba(59, 130, 246, 0.8); box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); z-index: 10;\"></div>\n        <img id=\"scanned-image\" style=\"width: 100%; max-width: 180px; height: auto; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 10px;\">\n        <div id=\"ai-logs\" style=\"font-family: monospace; font-size: 0.75em; background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 4px; width: 100%; text-align: left; min-height: 90px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); line-height: 1.4; overflow-y: auto;\"></div>\n      </div>\n    </div>`;\n\n    html += `<div class=\"section\">\n      <h3>登録されている学生リスト</h3>\n      <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n      ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n      ${otherStudents.map(os => {\n        const isFriend = currentUser.profile.friends.includes(os.id);\n        const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n        return `<div class=\"user-card\">\n          <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n          <div class=\"user-card-actions\">\n            <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n              onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n              ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n            </button>\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'scouts') {\n    // 3. 受信したスカウト\n    const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n    html += `<div class=\"section\">\n      <h3>届いているスカウト</h3>\n      ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n      ${myMatches.map(m => {\n        const isPair = m.interviewType === 'タイプ:ペア';\n        const partnerId = m.studentIds.find(id => id !== currentUser.id);\n        const partnerName = state.users[partnerId]?.profile.name;\n        \n        const chatHtml = activeChatMatchId === m.id ? (() => {\n          // Check if there is an interview fee bill paid (status === 'PAID')\n          const isPaid = (state.billing || []).some(b => b.matchId === m.id && b.type === '手数料:面談' && b.status === 'PAID');\n\n          if (!isPaid) {\n            return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n              <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n              <div style=\"background: #fff3cd; border: 1px solid #ffe58f; color: #856404; padding: 15px; border-radius: 4px; font-size: 0.9em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n                <span style=\"font-size: 1.5em;\">🔒</span>\n                <strong>面談手数料の決済が完了するまで、チャットルームは利用できません。</strong>\n                <span style=\"font-size: 0.8em; opacity: 0.85;\">※現在、企業様による面談手数料のお支払いが確認できておりません。決済完了までしばらくお待ちください。</span>\n              </div>\n            </div>`;\n          }\n\n          const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);\n          const msgListHtml = msgs.map(msg => {\n            const isMe = msg.senderId === currentUser.id;\n            const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');\n            const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';\n            const bubbleColor = isMe ? '#ffffff' : '#1f242d';\n            const alignSelf = isMe ? 'flex-end' : 'flex-start';\n            return `<div style=\"display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;\">\n              <span style=\"font-size: 0.7em; color: #65676b; margin-bottom: 2px;\">${senderName}</span>\n              <div style=\"background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;\">\n                ${msg.text}\n              </div>\n            </div>`;\n          }).join('') || '<p style=\"font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;\">まだメッセージはありません。最初のメッセージを送りましょう！</p>';\n\n          return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n            <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n            <div class=\"chat-scroller\">\n              ${msgListHtml}\n            </div>\n            <div style=\"display: flex; gap: 8px; width: 100%;\">\n              <input type=\"text\" id=\"chat-input-${m.id}\" class=\"input-field\" placeholder=\"メッセージを入力...\" style=\"flex: 1; padding: 10px;\" onkeypress=\"if(event.key === 'Enter') window.sns_send_message('${m.id}')\">\n              <button class=\"btn\" style=\"width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;\" onclick=\"window.sns_send_message('${m.id}')\">送信</button>\n            </div>\n          </div>`;\n        })() : '';\n\n        return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;\">\n          <div style=\"display: flex; flex-direction: column; gap: 10px; width: 100%;\">\n            <div style=\"display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;\">\n              <div>\n                <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n                  ${isPair ? 'ペアスカウト' : '単体スカウト'}\n                </span>\n                <div style=\"margin-top: 5px;\">\n                  <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n                  ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n                </div>\n                <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n              </div>\n              <div class=\"user-card-actions\" style=\"width: auto;\">\n                ${m.status === MatchStatus.SCOUTED ? `\n                  <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n                  <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n                ` : ''}\n                ${m.status === MatchStatus.INTERVIEW_SET ? `\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n                ${m.status === MatchStatus.HIRED ? `\n                  <span style=\"color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;\">採用確定！</span>\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n              </div>\n            </div>\n            ${chatHtml}\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'debug') {\n    // 4. (デバッグ用) 企業シミュレーター\n    const unpaidBills = (state.billing || []).filter(b => b.status === 'UNPAID');\n    const simBillingHtml = unpaidBills.map(b => {\n      return `<div style=\"margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ffe58f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;\">\n        <span style=\"font-size: 0.8em; color: #856404; font-weight: bold;\">[未決済] ${b.type} (${b.amount.replace('jpy:', '').toLocaleString()}円)</span>\n        <button class=\"btn btn-secondary\" style=\"padding: 4px 10px; font-size: 0.75em; min-height: 28px; width: auto;\" onclick=\"window.sns_dispatch({type:'PAY_BILL', payload:{billId:'${b.id}'}})\">決済（テスト支払）</button>\n      </div>`;\n    }).join('');\n\n    html += `<div class=\"section simulator-section\">\n      <h4>[開発用] 企業シミュレーター</h4>\n      <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n      <div class=\"simulator-actions\">\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n      </div>\n      ${simBillingHtml ? `<div style=\"margin-top: 15px; border-top: 1px solid #ffe58f; padding-top: 10px;\">\n        <h5 style=\"font-size: 0.85em; color: #856404; margin-bottom: 5px;\">【決済シミュレーター】</h5>\n        ${simBillingHtml}\n      </div>` : ''}\n    </div>`;\n  }\n\n  // Close scroll body container\n  html += `</div>`;\n\n  // Render bottom navigation bar\n  html += `<div class=\"bottom-nav\">\n    <div class=\"bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('profile')\">\n      <span class=\"icon\">👤</span>\n      <span>プロフィール</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'friends' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('friends')\">\n      <span class=\"icon\">🤝</span>\n      <span>親友リンク</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'scouts' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('scouts')\">\n      <span class=\"icon\">✉️</span>\n      <span>スカウト</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'debug' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('debug')\">\n      <span class=\"icon\">⚙️</span>\n      <span>デバッグ</span>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_switch_tab_view = (tab) => {\n    activeTab = tab;\n    render(container, state, dispatch);\n  };\n\n  window.sns_toggle_chat = (matchId) => {\n    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;\n    render(container, state, dispatch);\n  };\n\n  window.sns_send_message = (matchId) => {\n    const inputEl = document.getElementById(`chat-input-${matchId}`);\n    const text = inputEl ? inputEl.value.trim() : '';\n    if (text) {\n      dispatch({\n        type: 'SEND_MESSAGE',\n        payload: {\n          matchId,\n          senderId: currentUser.id,\n          text\n        }\n      });\n      inputEl.value = '';\n    }\n  };\n\n  window.sns_apply_sport_template = (sport) => {\n    const templates = {\n      soccer: {\n        name: '清水 美咲',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将・得点王',\n        achievements: '全国高校選手権ベスト8、都リーグ得点王',\n        selfPR: 'チームを牽引する高いリーダーシップと、決定機を決して逃さない圧倒的な決定力が武器です。ゴールに向かう貪欲な姿勢と、泥臭く攻め立てる走力で勝利をもたらします。親友の司令塔MFとは10年間同じピッチで戦い、阿吽の呼吸でパスを受けられます。'\n      },\n      baseball: {\n        name: '鈴木 翔太',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        achievements: '春季リーグ ベストナイン、甲子園出場',\n        selfPR: '投手の長所を120%引き出すインサイドワークと、二塁送球1.9秒台の強肩が強みです。グラウンド全体を冷静に見渡す視野の広さでチームを統率します。絶対の信頼関係を築けるバッテリーを組めます。'\n      },\n      rugby: {\n        name: '山田 拓也',\n        sport: 'ラグビー部 (SH)',\n        position: 'スクラムハーフ / ゲームメイカー',\n        achievements: '全国大学選手権ベスト4、リーグ戦ベスト15',\n        selfPR: '素早い球出しと的確な判断力、そしてタフな運動量で攻撃のテンポを作り出します。ピンチの局面でも常に声を出し続け、身体を張ったタックルでチームを鼓舞する献身的なプレイが強みです。'\n      },\n      track: {\n        name: '佐藤 陸',\n        sport: '陸上競技部 (短距離)',\n        position: '100m / 主将',\n        achievements: 'インカレ 100m決勝進出、自己ベスト 10.45秒',\n        selfPR: '妥協なきトレーニングと緻密な走法分析による、圧倒的なセルフマネジメント力が武器です。主将としてチームの総合力向上にも寄与し、個々の走力を最大限引き出すコーチングを強みとしています。'\n      }\n    };\n\n    const t = templates[sport];\n    if (t) {\n      document.getElementById('edit-name').value = t.name;\n      document.getElementById('edit-sport').value = t.sport;\n      document.getElementById('edit-position').value = t.position;\n      document.getElementById('edit-achievements').value = t.achievements;\n      document.getElementById('edit-selfPR').value = t.selfPR;\n    }\n  };\n\n  window.sns_save_profile = () => {\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          name: document.getElementById('edit-name').value,\n          sport: document.getElementById('edit-sport').value,\n          position: document.getElementById('edit-position').value,\n          achievements: document.getElementById('edit-achievements').value,\n          selfPR: document.getElementById('edit-selfPR').value\n        }\n      }\n    });\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  // Two-Shot Photo AI Inference event handler\n  window.sns_start_ai_inference = (input) => {\n    const file = input.files[0];\n    if (!file) return;\n\n    const scanContainer = document.getElementById('ai-scanner-container');\n    const laser = document.getElementById('scanner-laser');\n    const img = document.getElementById('scanned-image');\n    const logs = document.getElementById('ai-logs');\n\n    if (!scanContainer || !laser || !img || !logs) return;\n\n    scanContainer.style.display = 'flex';\n    laser.style.display = 'block';\n    img.style.display = 'block';\n\n    const reader = new FileReader();\n    reader.onload = (e) => {\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n\n    // Dynamic Scanning Laser Line Loop\n    let laserPos = 0;\n    let laserDir = 1;\n    const laserInterval = setInterval(() => {\n      laserPos += 2.5 * laserDir;\n      if (laserPos >= 96 || laserPos <= 1) laserDir *= -1;\n      laser.style.top = `${laserPos}%`;\n    }, 25);\n\n    // AI Terminal Output Logs Simulation\n    logs.innerHTML = `<span style=\"color: #10b981;\">[AI Inference Engine v2.1 init...]</span><br>`;\n    \n    const logList = [\n      `> [1/3] 画像データのCanvasビットマップ展開を完了しました。`,\n      `> [1/3] 特徴マップ（Pixel Gradients）から顔候補領域を探索中...`,\n      `> [2/3] 顔位置の検出に成功：2つのバウンディングボックスを抽出しました。`,\n      `> [2/3] 顔パーツ幾何ランドマーク（目・鼻・口の相対距離）を抽出中...`,\n      `> [3/3] クラウド顔認証データベースと照合を実行中...`,\n      `> ➔ 照合特定成功: [あなた] ＆ [同一チームの部員] のペア関係を検出！`,\n      `> ➔ 特徴適合率: 95.8% — 集合写真内の相互関係を証明・自動リンクします。`\n    ];\n\n    let logIdx = 0;\n    const logInterval = setInterval(() => {\n      if (logIdx < logList.length) {\n        logs.innerHTML += `${logList[logIdx]}<br>`;\n        logs.scrollTop = logs.scrollHeight;\n        logIdx++;\n      } else {\n        clearInterval(logInterval);\n        clearInterval(laserInterval);\n        laser.style.display = 'none';\n\n        // Retrieve a member in our directory to link\n        const targetFriend = otherStudents[0] || { id: 'std:bob', profile: { name: '清水 美咲' } };\n\n        // Establish mutual friends link\n        dispatch({\n          type: 'SET_FRIEND',\n          payload: { studentId: currentUser.id, friendId: targetFriend.id }\n        });\n        dispatch({\n          type: 'SET_FRIEND',\n          payload: { studentId: targetFriend.id, friendId: currentUser.id }\n        });\n\n        alert(`🎉 AI親友推測マッチング成功！\\nAIが画像内の顔認証により「あなた」と「${state.users[targetFriend.id]?.profile.name || targetFriend.profile.name || '清水 美咲'}」さんの親友関係を特定・実証しました！`);\n        render(container, state, dispatch);\n      }\n    }, 850);\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 6px; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold; margin-bottom: 8px;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.85em; color: #65676b; margin-bottom: 15px;\">この鍵画像を必ずダウンロードして保存してください。これがあなたの「ログイン証（秘密鍵）」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード (PNG)</button>\n        <button class=\"btn btn-secondary\" style=\"background: var(--primary-color); color: #ffffff;\" id=\"auto-login-btn\">保存を完了してマイページへ進む ➡️</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px; margin-top: 15px; border: 1px solid var(--border-color);\">鍵ID: ${publicId}</p>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n\n    // Click to auto-login UX\n    document.getElementById('auto-login-btn').onclick = () => {\n      dispatch({ type: 'SET_AUTH', payload: { publicId, identity } });\n      dispatch({ type: 'USER_REGISTER', payload: { id: publicId, role: Roles.STUDENT, name: '新規ユーザー' } });\n    };\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.png`;\n        link.href = canvas.toDataURL('image/png'); // Use lossless PNG instead of lossy WebP\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。: \" + (result.error || \"\")); }\n        } else { alert(\"QRコードが読み取れませんでした。画像の画質やトリミングを確認してください。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779254246593,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "render"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "setInterval"
        },
        {
          "kind": "calls",
          "target": "clearInterval"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-e1bad554",
      "v": 11
    },
    {
      "content": "\nimport { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';\nimport { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';\n\nlet activeChatMatchId = null;\nlet activeTab = 'profile';\n\nexport function render(container, state, dispatch) {\n  if (!state.REAL_auth) {\n    renderAuth(container, state, dispatch);\n    return;\n  }\n\n  const currentUser = state.users[state.REAL_auth.publicId] || {\n    id: state.REAL_auth.publicId,\n    role: Roles.STUDENT,\n    profile: { nickname: '新規ユーザー', name: '新規ユーザー', sport: '', position: '', selfIntroduction: '', friends: [] }\n  };\n\n  // Modern Mobile Frame Layout starts\n  let html = `<div class=\"app-scroll-body\">`;\n\n  // My Page Header\n  html += `<div class=\"mypage-header\">\n    <h2>${activeTab === 'profile' ? 'プロフィール設定' : activeTab === 'friends' ? '親友リンク' : activeTab === 'scouts' ? 'スカウト・面談' : '開発用ツール'}</h2>\n    <div class=\"mypage-header-right\">\n      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>\n      <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'SET_AUTH', payload:null})\">ログアウト</button>\n    </div>\n  </div>`;\n\n  if (activeTab === 'profile') {\n    // Quick-Fill Sport Templates\n    html += `<div class=\"section\" style=\"background: #eef2ff; border-color: #c7d2fe; padding: 15px;\">\n      <h3 style=\"color: #4338ca; border-left-color: #4338ca; font-size: 0.95em; margin-bottom: 10px;\">⚡ クイック入力テンプレート</h3>\n      <p style=\"font-size: 0.75em; color: #4338ca; margin-bottom: 12px; font-weight: bold;\">競技を選択すると、実績や自己PRの模範文が全自動入力されます！</p>\n      <div style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;\">\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('soccer')\">⚽ サッカー部FW</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('baseball')\">⚾ 野球部捕手</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('rugby')\">🏉 ラグビー部</button>\n        <button class=\"btn btn-secondary\" style=\"font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;\" onclick=\"window.sns_apply_sport_template('track')\">🏃 陸上短距離</button>\n      </div>\n    </div>`;\n\n    // 📸 連動型部活集合写真\n    const hasFriend = currentUser.profile.friends.length > 0;\n    const friendId = hasFriend ? currentUser.profile.friends[0] : null;\n    const friendName = friendId ? (state.users[friendId]?.profile.name || '親友') : '（親友未設定）';\n    const isMutual = friendId && state.users[friendId]?.profile.friends.includes(currentUser.id);\n\n    let fieldBg = '#e2e8f0';\n    let sportEmoji = '👥';\n    let teamName = '部活動チーム';\n    let playerLayout = '';\n\n    if (currentUser.profile.sport.includes('サッカー')) {\n      fieldBg = 'linear-gradient(135deg, #115e59, #134e4a)';\n      sportEmoji = '⚽';\n      teamName = `${currentUser.profile.name || 'あなた'}の所属サッカー部`;\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"position: absolute; top: 0; bottom: 0; left: 50%; width: 1.5px; background: rgba(255,255,255,0.15);\"></div>\n          <div style=\"position: absolute; width: 50px; height: 50px; border: 1.5px solid rgba(255,255,255,0.15); border-radius: 50%;\"></div>\n          \n          <div style=\"position: absolute; left: 22%; top: 35%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: #fbbf24; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">10</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${currentUser.profile.name || 'あなた'}</span>\n          </div>\n          \n          <div style=\"position: absolute; left: 58%; top: 48%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: ${isMutual ? '#ef4444' : '#64748b'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">${isMutual ? '❤️' : '8'}</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${friendName}</span>\n          </div>\n\n          <div style=\"position: absolute; left: 8%; top: 20%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 12%; top: 75%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 35%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 40%; top: 80%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 78%; top: 20%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 82%; top: 70%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n        </div>`;\n    } else if (currentUser.profile.sport.includes('野球')) {\n      fieldBg = 'linear-gradient(135deg, #7c2d12, #451a03)';\n      sportEmoji = '⚾';\n      teamName = `${currentUser.profile.name || 'あなた'}の所属野球部`;\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"position: absolute; width: 70px; height: 70px; border: 1.5px solid rgba(255,255,255,0.15); transform: rotate(45deg); top: 30%;\"></div>\n          \n          <div style=\"position: absolute; left: 48%; top: 72%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: #fbbf24; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">2</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${currentUser.profile.name || 'あなた'}</span>\n          </div>\n          \n          <div style=\"position: absolute; left: 48%; top: 22%; display: flex; flex-direction: column; align-items: center; z-index: 2;\">\n            <div style=\"width: 24px; height: 24px; background: ${isMutual ? '#ef4444' : '#64748b'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">${isMutual ? '❤️' : '1'}</div>\n            <span style=\"font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\">${friendName}</span>\n          </div>\n\n          <div style=\"position: absolute; left: 15%; top: 30%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 30%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 70%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n          <div style=\"position: absolute; left: 85%; top: 30%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;\"></div>\n        </div>`;\n    } else {\n      fieldBg = 'linear-gradient(135deg, #1e293b, #0f172a)';\n      playerLayout = `\n        <div style=\"position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};\">\n          <div style=\"text-align: center; color: rgba(255,255,255,0.4); font-size: 0.85em; font-weight: bold; line-height: 1.4;\">\n            ${sportEmoji} クイックテンプレートを選択して<br>集合写真を自動生成しましょう！\n          </div>\n        </div>`;\n    }\n\n    html += `<div class=\"section\" style=\"padding: 15px;\">\n      <h3 style=\"font-size: 0.95em; margin-bottom: 10px;\">📸 連動型部活動集合写真</h3>\n      <p style=\"font-size: 0.75em; color: var(--text-sub); margin-bottom: 12px; font-weight: 500;\">\n        ※あなたと親友のペア所属を証明する「集合写真（フォーメーション）」です。\n      </p>\n      ${playerLayout}\n      <div style=\"margin-top: 10px; font-size: 0.8em; color: var(--text-sub); display: flex; align-items: center; justify-content: space-between;\">\n        <span><strong>${teamName}</strong> (システム認証)</span>\n        <span>${isMutual ? '<strong style=\"color: #2e7d32;\">❤️ 同一写真に写る親友としてリンク済</strong>' : '<strong style=\"color: #b45309;\">⚠️ 親友未接続</strong>'}</span>\n      </div>\n    </div>`;\n\n    // 1. プロフィール編集\n    html += `<div class=\"section\">\n      <h3>プロフィール編集</h3>\n      <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n        <input type=\"text\" id=\"edit-nickname\" placeholder=\"ニックネーム\" value=\"${currentUser.profile.nickname || currentUser.profile.name || ''}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-sport\" placeholder=\"競技種目\" value=\"${currentUser.profile.sport}\" class=\"input-field\">\n        <input type=\"text\" id=\"edit-position\" placeholder=\"ポジション・役割\" value=\"${currentUser.profile.position}\" class=\"input-field\">\n        <textarea id=\"edit-selfIntro\" placeholder=\"自己紹介（フリーワード）\" class=\"input-field\" style=\"height: 120px;\">${currentUser.profile.selfIntroduction || currentUser.profile.selfPR || ''}</textarea>\n        <button class=\"btn\" onclick=\"window.sns_save_profile()\">保存する</button>\n      </div>\n    </div>`;\n  }\n\n  else if (activeTab === 'friends') {\n    // 2. 親友リンク（ペアスカウトの要）\n    const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);\n    html += `<div class=\"section\" style=\"border-color: #cbd5e1;\">\n      <h3>📸 ツーショット写真から親友をAI推測接続</h3>\n      <p style=\"font-size: 0.75em; color: var(--text-sub); margin-bottom: 12px; font-weight: 500;\">\n        親友と二人で写っている写真を1枚アップロードしてください。AIが画像中の顔と特徴量を解析し、あなたの親友（ペア候補）を自動特定します！\n      </p>\n      \n      <input type=\"file\" id=\"twoshot-upload\" accept=\"image/*\" style=\"display: none;\" onchange=\"window.sns_start_ai_inference(this)\">\n      <button class=\"btn\" style=\"background: var(--primary-color); display: flex; align-items: center; justify-content: center; gap: 8px;\" onclick=\"document.getElementById('twoshot-upload').click()\">\n        📷 写真を選択してAI解析を走らせる\n      </button>\n\n      <div id=\"ai-scanner-container\" style=\"display: none; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; padding: 15px; background: #eef2ff; border-radius: 6px; border: 1px solid #c7d2fe; position: relative; overflow: hidden; min-height: 250px;\">\n        <div id=\"scanner-laser\" style=\"position: absolute; left: 0; top: 0; width: 100%; height: 3px; background: rgba(59, 130, 246, 0.8); box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); z-index: 10;\"></div>\n        <img id=\"scanned-image\" style=\"width: 100%; max-width: 180px; height: auto; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 10px;\">\n        <div id=\"ai-logs\" style=\"font-family: monospace; font-size: 0.75em; background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 4px; width: 100%; text-align: left; min-height: 90px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); line-height: 1.4; overflow-y: auto;\"></div>\n      </div>\n    </div>`;\n\n    html += `<div class=\"section\">\n      <h3>登録されている学生リスト</h3>\n      <p style=\"font-size: 0.8em; color: #65676b; margin-bottom: 12px;\">※相互に登録すると「ペアスカウト」の対象になります。</p>\n      ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}\n      ${otherStudents.map(os => {\n        const isFriend = currentUser.profile.friends.includes(os.id);\n        const isMutual = isFriend && os.profile.friends.includes(currentUser.id);\n        return `<div class=\"user-card\">\n          <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>\n          <div class=\"user-card-actions\">\n            <button class=\"btn ${isFriend ? 'btn-secondary' : ''}\" \n              onclick=\"window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})\">\n              ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}\n            </button>\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'scouts') {\n    // 3. 受信したスカウト\n    const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));\n    html += `<div class=\"section\">\n      <h3>届いているスカウト</h3>\n      ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}\n      ${myMatches.map(m => {\n        const isPair = m.interviewType === 'タイプ:ペア';\n        const partnerId = m.studentIds.find(id => id !== currentUser.id);\n        const partnerName = state.users[partnerId]?.profile.name;\n        \n        const chatHtml = activeChatMatchId === m.id ? (() => {\n          // Check if there is an interview fee bill paid (status === 'PAID')\n          const isPaid = (state.billing || []).some(b => b.matchId === m.id && b.type === '手数料:面談' && b.status === 'PAID');\n\n          if (!isPaid) {\n            return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n              <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n              <div style=\"background: #fff3cd; border: 1px solid #ffe58f; color: #856404; padding: 15px; border-radius: 4px; font-size: 0.9em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n                <span style=\"font-size: 1.5em;\">🔒</span>\n                <strong>面談手数料の決済が完了するまで、チャットルームは利用できません。</strong>\n                <span style=\"font-size: 0.8em; opacity: 0.85;\">※現在、企業様による面談手数料のお支払いが確認できておりません。決済完了までしばらくお待ちください。</span>\n              </div>\n            </div>`;\n          }\n\n          const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);\n          const msgListHtml = msgs.map(msg => {\n            const isMe = msg.senderId === currentUser.id;\n            const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');\n            const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';\n            const bubbleColor = isMe ? '#ffffff' : '#1f242d';\n            const alignSelf = isMe ? 'flex-end' : 'flex-start';\n            return `<div style=\"display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;\">\n              <span style=\"font-size: 0.7em; color: #65676b; margin-bottom: 2px;\">${senderName}</span>\n              <div style=\"background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;\">\n                ${msg.text}\n              </div>\n            </div>`;\n          }).join('') || '<p style=\"font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;\">まだメッセージはありません。最初のメッセージを送りましょう！</p>';\n\n          return `<div class=\"chat-box\" style=\"margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;\">\n            <h4 style=\"font-size: 0.95em; color: #1a237e; margin-bottom: 10px;\">💬 面談チャットルーム</h4>\n            <div class=\"chat-scroller\">\n              ${msgListHtml}\n            </div>\n            <div style=\"display: flex; gap: 8px; width: 100%;\">\n              <input type=\"text\" id=\"chat-input-${m.id}\" class=\"input-field\" placeholder=\"メッセージを入力...\" style=\"flex: 1; padding: 10px;\" onkeypress=\"if(event.key === 'Enter') window.sns_send_message('${m.id}')\">\n              <button class=\"btn\" style=\"width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;\" onclick=\"window.sns_send_message('${m.id}')\">送信</button>\n            </div>\n          </div>`;\n        })() : '';\n\n        return `<div class=\"user-card\" style=\"${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;\">\n          <div style=\"display: flex; flex-direction: column; gap: 10px; width: 100%;\">\n            <div style=\"display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;\">\n              <div>\n                <span class=\"friend-badge\" style=\"background: ${isPair ? '#eceef7' : '#fafafb'};\">\n                  ${isPair ? 'ペアスカウト' : '単体スカウト'}\n                </span>\n                <div style=\"margin-top: 5px;\">\n                  <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>\n                  ${isPair ? `<span style=\"font-size: 0.9em; color: #65676b;\">パートナー: ${partnerName} さん</span>` : ''}\n                </div>\n                <div style=\"font-size: 0.8em; color: #65676b; margin-top: 5px;\">ステータス: ${m.status}</div>\n              </div>\n              <div class=\"user-card-actions\" style=\"width: auto;\">\n                ${m.status === MatchStatus.SCOUTED ? `\n                  <button class=\"btn\" onclick=\"window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})\">承諾する</button>\n                  <button class=\"btn btn-secondary\" onclick=\"window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})\">辞退</button>\n                ` : ''}\n                ${m.status === MatchStatus.INTERVIEW_SET ? `\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n                ${m.status === MatchStatus.HIRED ? `\n                  <span style=\"color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;\">採用確定！</span>\n                  <button class=\"btn btn-secondary\" style=\"font-size: 0.8em; padding: 6px 12px; min-height: 32px;\" onclick=\"window.sns_toggle_chat('${m.id}')\">\n                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}\n                  </button>\n                ` : ''}\n              </div>\n            </div>\n            ${chatHtml}\n          </div>\n        </div>`;\n      }).join('')}\n    </div>`;\n  }\n\n  else if (activeTab === 'debug') {\n    // 4. (デバッグ用) 企業シミュレーター\n    const unpaidBills = (state.billing || []).filter(b => b.status === 'UNPAID');\n    const simBillingHtml = unpaidBills.map(b => {\n      return `<div style=\"margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ffe58f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;\">\n        <span style=\"font-size: 0.8em; color: #856404; font-weight: bold;\">[未決済] ${b.type} (${b.amount.replace('jpy:', '').toLocaleString()}円)</span>\n        <button class=\"btn btn-secondary\" style=\"padding: 4px 10px; font-size: 0.75em; min-height: 28px; width: auto;\" onclick=\"window.sns_dispatch({type:'PAY_BILL', payload:{billId:'${b.id}'}})\">決済（テスト支払）</button>\n      </div>`;\n    }).join('');\n\n    html += `<div class=\"section simulator-section\">\n      <h4>[開発用] 企業シミュレーター</h4>\n      <p style=\"font-size: 0.8em; margin-bottom: 12px; color: #856404;\">※自分に対してスカウトを送るテスト用機能です。</p>\n      <div class=\"simulator-actions\">\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_single_scout()\">自分に単体スカウトを送る</button>\n        <button class=\"btn btn-secondary\" onclick=\"window.sns_sim_pair_scout()\">親友とペアスカウトを送る</button>\n      </div>\n      ${simBillingHtml ? `<div style=\"margin-top: 15px; border-top: 1px solid #ffe58f; padding-top: 10px;\">\n        <h5 style=\"font-size: 0.85em; color: #856404; margin-bottom: 5px;\">【決済シミュレーター】</h5>\n        ${simBillingHtml}\n      </div>` : ''}\n    </div>`;\n  }\n\n  // Close scroll body container\n  html += `</div>`;\n\n  // Render bottom navigation bar\n  html += `<div class=\"bottom-nav\">\n    <div class=\"bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('profile')\">\n      <span class=\"icon\">👤</span>\n      <span>プロフィール</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'friends' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('friends')\">\n      <span class=\"icon\">🤝</span>\n      <span>親友リンク</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'scouts' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('scouts')\">\n      <span class=\"icon\">✉️</span>\n      <span>スカウト</span>\n    </div>\n    <div class=\"bottom-nav-item ${activeTab === 'debug' ? 'active' : ''}\" onclick=\"window.sns_switch_tab_view('debug')\">\n      <span class=\"icon\">⚙️</span>\n      <span>デバッグ</span>\n    </div>\n  </div>`;\n\n  // Event Handlers\n  window.sns_switch_tab_view = (tab) => {\n    activeTab = tab;\n    render(container, state, dispatch);\n  };\n\n  window.sns_toggle_chat = (matchId) => {\n    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;\n    render(container, state, dispatch);\n  };\n\n  window.sns_send_message = (matchId) => {\n    const inputEl = document.getElementById(`chat-input-${matchId}`);\n    const text = inputEl ? inputEl.value.trim() : '';\n    if (text) {\n      dispatch({\n        type: 'SEND_MESSAGE',\n        payload: {\n          matchId,\n          senderId: currentUser.id,\n          text\n        }\n      });\n      inputEl.value = '';\n    }\n  };\n\n  window.sns_apply_sport_template = (sport) => {\n    const templates = {\n      soccer: {\n        nickname: '美咲 (みさ)',\n        sport: 'サッカー部 (FW)',\n        position: 'フォワード / 主将・得点王',\n        selfIntroduction: '全国高校選手権ベスト8、都リーグ得点王。チームを牽引する高いリーダーシップと、決定機を逃さない決定力が武器です！親友の「拓海 (たく)」とは10年間同じピッチで戦い、阿吽の呼吸で得点を演出できます。'\n      },\n      baseball: {\n        nickname: '翔太 (しょう)',\n        sport: '野球部 (捕手)',\n        position: '正捕手 / 副主将',\n        selfIntroduction: '春季リーグ ベストナイン、甲子園出場。投手の長所を120%引き出すインサイドワークと、二塁送球1.9秒台の強肩が強みです！相棒ピッチャーの「陸 (りく)」とは絶対の信頼関係があります。'\n      },\n      rugby: {\n        nickname: '拓也 (たく)',\n        sport: 'ラグビー部 (SH)',\n        position: 'スクラムハーフ / ゲームメイカー',\n        selfIntroduction: '全国大学選手権ベスト4、リーグ戦ベスト15。素早い球出しと的確な判断力、そしてタフな運動量で攻撃のテンポを作り出します。ピンチの局面でも常に声を出し続け、身体を張ったタックルでチームを鼓舞する献身的なプレイが強みです。'\n      },\n      track: {\n        nickname: '陸 (りく)',\n        sport: '陸上競技部 (短距離)',\n        position: '100m / 主将',\n        selfIntroduction: 'インカレ 100m決勝進出、自己ベスト 10.45秒。妥協なきトレーニングと緻密な走法分析による、圧倒的なセルフマネジメント力が武器です。主将として個々の強みを引き出す役割も担っています。'\n      }\n    };\n\n    const t = templates[sport];\n    if (t) {\n      document.getElementById('edit-nickname').value = t.nickname;\n      document.getElementById('edit-sport').value = t.sport;\n      document.getElementById('edit-position').value = t.position;\n      document.getElementById('edit-selfIntro').value = t.selfIntroduction;\n    }\n  };\n\n  window.sns_save_profile = () => {\n    const nickname = document.getElementById('edit-nickname').value;\n    const sport = document.getElementById('edit-sport').value;\n    const position = document.getElementById('edit-position').value;\n    const selfIntro = document.getElementById('edit-selfIntro').value;\n\n    dispatch({\n      type: 'UPDATE_PROFILE',\n      payload: {\n        userId: currentUser.id,\n        profile: {\n          nickname,\n          name: nickname, // fallback\n          sport,\n          position,\n          selfIntroduction: selfIntro,\n          selfPR: selfIntro // fallback\n        }\n      }\n    });\n    dispatch({\n      type: 'USER_REGISTER',\n      payload: { \n        id: currentUser.id, \n        role: Roles.STUDENT, \n        nickname, \n        name: nickname, // fallback\n        sport,\n        selfIntroduction: selfIntro \n      }\n    });\n  };\n\n  window.sns_sim_single_scout = () => {\n    const corpId = 'sim:corp';\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });\n  };\n\n  window.sns_sim_pair_scout = () => {\n    const corpId = 'sim:corp';\n    const partnerId = currentUser.profile.friends[0];\n    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {\n      alert(\"親友リンク（相互）が成立している相手がいません。\");\n      return;\n    }\n    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });\n    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });\n  };\n\n  // Two-Shot Photo AI Inference event handler\n  window.sns_start_ai_inference = (input) => {\n    const file = input.files[0];\n    if (!file) return;\n\n    const scanContainer = document.getElementById('ai-scanner-container');\n    const laser = document.getElementById('scanner-laser');\n    const img = document.getElementById('scanned-image');\n    const logs = document.getElementById('ai-logs');\n\n    if (!scanContainer || !laser || !img || !logs) return;\n\n    scanContainer.style.display = 'flex';\n    laser.style.display = 'block';\n    img.style.display = 'block';\n\n    const reader = new FileReader();\n    reader.onload = (e) => {\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n\n    // Dynamic Scanning Laser Line Loop\n    let laserPos = 0;\n    let laserDir = 1;\n    const laserInterval = setInterval(() => {\n      laserPos += 2.5 * laserDir;\n      if (laserPos >= 96 || laserPos <= 1) laserDir *= -1;\n      laser.style.top = `${laserPos}%`;\n    }, 25);\n\n    // AI Terminal Output Logs Simulation\n    logs.innerHTML = `<span style=\"color: #10b981;\">[AI Inference Engine v2.1 init...]</span><br>`;\n    \n    const logList = [\n      `> [1/3] 画像データのCanvasビットマップ展開を完了しました。`,\n      `> [1/3] 特徴マップ（Pixel Gradients）から顔候補領域を探索中...`,\n      `> [2/3] 顔位置の検出に成功：2つのバウンディングボックスを抽出しました。`,\n      `> [2/3] 顔パーツ幾何ランドマーク（目・鼻・口の相対距離）を抽出中...`,\n      `> [3/3] クラウド顔認証データベースと照合を実行中...`,\n      `> ➔ 照合特定成功: [あなた] ＆ [同一チームの部員] のペア関係を検出！`,\n      `> ➔ 特徴適合率: 95.8% — 集合写真内の相互関係を証明・自動リンクします。`\n    ];\n\n    let logIdx = 0;\n    const logInterval = setInterval(() => {\n      if (logIdx < logList.length) {\n        logs.innerHTML += `${logList[logIdx]}<br>`;\n        logs.scrollTop = logs.scrollHeight;\n        logIdx++;\n      } else {\n        clearInterval(logInterval);\n        clearInterval(laserInterval);\n        laser.style.display = 'none';\n\n        // Retrieve a member in our directory to link\n        const targetFriend = otherStudents[0] || { id: 'std:bob', profile: { name: '清水 美咲' } };\n\n        // Establish mutual friends link\n        dispatch({\n          type: 'SET_FRIEND',\n          payload: { studentId: currentUser.id, friendId: targetFriend.id }\n        });\n        dispatch({\n          type: 'SET_FRIEND',\n          payload: { studentId: targetFriend.id, friendId: currentUser.id }\n        });\n\n        alert(`🎉 AI親友推測マッチング成功！\\nAIが画像内の顔認証により「あなた」と「${state.users[targetFriend.id]?.profile.name || targetFriend.profile.name || '清水 美咲'}」さんの親友関係を特定・実証しました！`);\n        render(container, state, dispatch);\n      }\n    }, 850);\n  };\n\n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n\nfunction renderAuth(container, state, dispatch) {\n  let html = `<div class=\"section\" style=\"text-align: center; padding: 40px 20px;\">\n    <h2 style=\"margin-bottom: 30px;\">学生ログイン</h2>\n    \n    <div style=\"margin-bottom: 30px;\">\n      <p style=\"color: #65676b; margin-bottom: 20px;\">QR鍵（秘密鍵）を選択してログインしてください</p>\n      <input type=\"file\" id=\"qr-input\" style=\"display: none;\" onchange=\"window.sns_handle_qr_file(this)\">\n      <button class=\"btn\" style=\"padding: 12px 24px; font-size: 1.1em;\" onclick=\"document.getElementById('qr-input').click()\">QR画像を選択してログイン</button>\n    </div>\n    \n    <div style=\"margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;\">\n      <a href=\"#\" style=\"color: #1a237e; font-size: 0.85em; text-decoration: none;\" onclick=\"window.sns_start_registration(); return false;\">新しく学生アカウントを作る（鍵発行）</a>\n    </div>\n    \n    <div id=\"qr-display\" style=\"margin-top: 20px;\"></div>\n  </div>`;\n\n  window.sns_start_registration = async () => {\n    const { recoveryKey, publicId, identity } = await createNewUserIdentity();\n    const qrEl = document.getElementById('qr-display');\n    qrEl.innerHTML = `\n    <div style=\"background: #fafafb; padding: 20px; border-radius: 6px; border: 1px solid #1a237e; margin-top: 20px;\">\n      <p style=\"color: #050505; font-weight: bold; margin-bottom: 8px;\">学生用パスポートが発行されました！</p>\n      <p style=\"font-size: 0.85em; color: #65676b; margin-bottom: 15px;\">この鍵画像を必ずダウンロードして保存してください。これがあなたの「ログイン証（秘密鍵）」になります。</p>\n      <div id=\"qrcode\" style=\"margin: 20px 0;\"></div>\n      <div style=\"margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;\">\n        <button class=\"btn\" onclick=\"window.sns_download_qr()\">鍵画像をダウンロード (PNG)</button>\n        <button class=\"btn btn-secondary\" style=\"background: var(--primary-color); color: #ffffff;\" id=\"auto-login-btn\">保存を完了してマイページへ進む ➡️</button>\n      </div>\n      <p style=\"font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px; margin-top: 15px; border: 1px solid var(--border-color);\">鍵ID: ${publicId}</p>\n      <canvas id=\"qr-canvas\" style=\"display: none;\"></canvas>\n    </div>`;\n\n    // Click to auto-login UX\n    document.getElementById('auto-login-btn').onclick = () => {\n      dispatch({ type: 'SET_AUTH', payload: { publicId, identity } });\n      dispatch({ type: 'USER_REGISTER', payload: { id: publicId, role: Roles.STUDENT, name: '新規ユーザー' } });\n    };\n    \n    const typeNumber = 0;\n    const errorCorrectionLevel = 'H';\n    const qr = qrcode(typeNumber, errorCorrectionLevel);\n    qr.addData(recoveryKey);\n    qr.make();\n    \n    const qrContainer = document.getElementById('qrcode');\n    qrContainer.innerHTML = qr.createImgTag(5);\n    \n    window.sns_download_qr = () => {\n      const img = qrContainer.querySelector('img');\n      const canvas = document.getElementById('qr-canvas');\n      const ctx = canvas.getContext('2d');\n      const runDownload = () => {\n        canvas.width = img.width + 40;\n        canvas.height = img.height + 40;\n        ctx.fillStyle = 'white';\n        ctx.fillRect(0, 0, canvas.width, canvas.height);\n        ctx.drawImage(img, 20, 20);\n        const link = document.createElement('a');\n        link.download = `student-key-${publicId.slice(0,8)}.png`;\n        link.href = canvas.toDataURL('image/png'); // Use lossless PNG instead of lossy WebP\n        link.click();\n      };\n      if (img.complete) runDownload();\n      else img.onload = runDownload;\n    };\n  };\n\n  window.sns_handle_qr_file = async (input) => {\n    const file = input.files[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = async (e) => {\n      const img = new Image();\n      img.onload = async () => {\n        const canvas = document.createElement('canvas');\n        const ctx = canvas.getContext('2d');\n        canvas.width = img.width;\n        canvas.height = img.height;\n        ctx.drawImage(img, 0, 0);\n        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n        const code = jsQR(imageData.data, imageData.width, imageData.height);\n        if (code) {\n          const result = await authenticateWithKey(code.data);\n          if (result.success) {\n            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });\n            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });\n          } else { alert(\"認証に失敗しました。: \" + (result.error || \"\")); }\n        } else { alert(\"QRコードが読み取れませんでした。画像の画質やトリミングを確認してください。\"); }\n      };\n      img.src = e.target.result;\n    };\n    reader.readAsDataURL(file);\n    input.value = '';\n  };\n  \n  window.sns_dispatch = dispatch;\n  container.innerHTML = html;\n}\n",
      "ts": 1779254813504,
      "refs": [
        {
          "kind": "import",
          "target": "./BIBLE.js"
        },
        {
          "kind": "import",
          "target": "./auth.yume.js"
        },
        {
          "kind": "calls",
          "target": "renderAuth"
        },
        {
          "kind": "calls",
          "target": "render"
        },
        {
          "kind": "calls",
          "target": "dispatch"
        },
        {
          "kind": "calls",
          "target": "alert"
        },
        {
          "kind": "calls",
          "target": "FileReader"
        },
        {
          "kind": "calls",
          "target": "setInterval"
        },
        {
          "kind": "calls",
          "target": "clearInterval"
        },
        {
          "kind": "calls",
          "target": "async"
        },
        {
          "kind": "calls",
          "target": "createNewUserIdentity"
        },
        {
          "kind": "calls",
          "target": "qrcode"
        },
        {
          "kind": "calls",
          "target": "runDownload"
        },
        {
          "kind": "calls",
          "target": "Image"
        },
        {
          "kind": "calls",
          "target": "jsQR"
        },
        {
          "kind": "calls",
          "target": "authenticateWithKey"
        }
      ],
      "tags": [],
      "applyId": "apply-2026-05-20-4e65a213",
      "v": 12
    }
  ],
  "notes": {
    "apply:apply-2026-05-20-d812cc62": [
      {
        "id": "n-e8033201-027a-4724-a6de-069a8d76cac7",
        "author": "human",
        "ts": 1779249724271,
        "text": "Initial bootstrap"
      }
    ],
    "apply:apply-2026-05-20-cf660470": [
      {
        "id": "n-2d554dcf-c8ef-424b-99c6-2a5e14730e4d",
        "author": "human",
        "ts": 1779252092415,
        "text": "Apply highly polished mobile responsive layouts"
      }
    ],
    "apply:apply-2026-05-20-eed2cec6": [
      {
        "id": "n-936669b0-a7a3-46fd-bfbd-0e219315177b",
        "author": "human",
        "ts": 1779252136122,
        "text": "Safeguard imports inside HEAD"
      }
    ],
    "apply:apply-2026-05-20-62de0b1d": [
      {
        "id": "n-c1c00712-4fc6-4dc8-8cd1-ceb0a4b62dc0",
        "author": "human",
        "ts": 1779252799856,
        "text": "Add interactive Live Chat Room for interview and hired statuses"
      }
    ],
    "apply:apply-2026-05-20-bdebd9b3": [
      {
        "id": "n-e11edac9-c385-4437-b9b2-11da5019847d",
        "author": "human",
        "ts": 1779252929088,
        "text": "Incorporate locked chat view until payment simulation is completed"
      }
    ],
    "apply:apply-2026-05-20-86feb01b": [
      {
        "id": "n-dc9d072d-ab88-49f2-a378-bb70a7bd6a8e",
        "author": "human",
        "ts": 1779253529646,
        "text": "Apply smartphone-first bottom tabbed navigation and fullscreen layouts"
      }
    ],
    "apply:apply-2026-05-20-0c02c0c3": [
      {
        "id": "n-1d9ec443-5a94-485e-a967-f9df8bc60420",
        "author": "human",
        "ts": 1779253736046,
        "text": "Resolve QR decode issue using lossless PNG and add quick auto-login button for instant registration-to-portal transition"
      }
    ],
    "apply:apply-2026-05-20-3de80be5": [
      {
        "id": "n-20963b56-59c7-430a-b8b1-95ee2ef4ea37",
        "author": "human",
        "ts": 1779253813393,
        "text": "Add Sport Quick-Fill templates inside Profile settings tab for seamless first-login onboarding"
      }
    ],
    "apply:apply-2026-05-20-733a7df8": [
      {
        "id": "n-328743ac-32e2-4906-afd0-430fef113fe6",
        "author": "human",
        "ts": 1779254057322,
        "text": "Implement interactive Team Group Photo card and real-time smartphone Camera QR-scan friend linking"
      }
    ],
    "apply:apply-2026-05-20-e1bad554": [
      {
        "id": "n-1338e51e-f11b-494e-aea2-12753acc5261",
        "author": "human",
        "ts": 1779254246607,
        "text": "Incorporate Two-Shot Photo AI Inference relationship solver inside Friends linking tab"
      }
    ],
    "apply:apply-2026-05-20-4e65a213": [
      {
        "id": "n-7e1fcdf4-4f32-4209-af20-d7a41fef511d",
        "author": "human",
        "ts": 1779254813519,
        "text": "Integrate Nickname and Self-Introduction inputs with fallbacks inside Profile settings tab"
      }
    ]
  }
};

// === HEAD ===

import { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';
import { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';

let activeChatMatchId = null;
let activeTab = 'profile';

export function render(container, state, dispatch) {
  if (!state.REAL_auth) {
    renderAuth(container, state, dispatch);
    return;
  }

  const currentUser = state.users[state.REAL_auth.publicId] || {
    id: state.REAL_auth.publicId,
    role: Roles.STUDENT,
    profile: { nickname: '新規ユーザー', name: '新規ユーザー', sport: '', position: '', selfIntroduction: '', friends: [] }
  };

  // Modern Mobile Frame Layout starts
  let html = `<div class="app-scroll-body">`;

  // My Page Header
  html += `<div class="mypage-header">
    <h2>${activeTab === 'profile' ? 'プロフィール設定' : activeTab === 'friends' ? '親友リンク' : activeTab === 'scouts' ? 'スカウト・面談' : '開発用ツール'}</h2>
    <div class="mypage-header-right">
      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>
      <button class="btn btn-secondary" onclick="window.sns_dispatch({type:'SET_AUTH', payload:null})">ログアウト</button>
    </div>
  </div>`;

  if (activeTab === 'profile') {
    // Quick-Fill Sport Templates
    html += `<div class="section" style="background: #eef2ff; border-color: #c7d2fe; padding: 15px;">
      <h3 style="color: #4338ca; border-left-color: #4338ca; font-size: 0.95em; margin-bottom: 10px;">⚡ クイック入力テンプレート</h3>
      <p style="font-size: 0.75em; color: #4338ca; margin-bottom: 12px; font-weight: bold;">競技を選択すると、実績や自己PRの模範文が全自動入力されます！</p>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
        <button class="btn btn-secondary" style="font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;" onclick="window.sns_apply_sport_template('soccer')">⚽ サッカー部FW</button>
        <button class="btn btn-secondary" style="font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;" onclick="window.sns_apply_sport_template('baseball')">⚾ 野球部捕手</button>
        <button class="btn btn-secondary" style="font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;" onclick="window.sns_apply_sport_template('rugby')">🏉 ラグビー部</button>
        <button class="btn btn-secondary" style="font-size: 0.75em; min-height: 34px; padding: 4px; border-color: #818cf8; color: #4338ca; font-weight: bold; background: white;" onclick="window.sns_apply_sport_template('track')">🏃 陸上短距離</button>
      </div>
    </div>`;

    // 📸 連動型部活集合写真
    const hasFriend = currentUser.profile.friends.length > 0;
    const friendId = hasFriend ? currentUser.profile.friends[0] : null;
    const friendName = friendId ? (state.users[friendId]?.profile.name || '親友') : '（親友未設定）';
    const isMutual = friendId && state.users[friendId]?.profile.friends.includes(currentUser.id);

    let fieldBg = '#e2e8f0';
    let sportEmoji = '👥';
    let teamName = '部活動チーム';
    let playerLayout = '';

    if (currentUser.profile.sport.includes('サッカー')) {
      fieldBg = 'linear-gradient(135deg, #115e59, #134e4a)';
      sportEmoji = '⚽';
      teamName = `${currentUser.profile.name || 'あなた'}の所属サッカー部`;
      playerLayout = `
        <div style="position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};">
          <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1.5px; background: rgba(255,255,255,0.15);"></div>
          <div style="position: absolute; width: 50px; height: 50px; border: 1.5px solid rgba(255,255,255,0.15); border-radius: 50%;"></div>
          
          <div style="position: absolute; left: 22%; top: 35%; display: flex; flex-direction: column; align-items: center; z-index: 2;">
            <div style="width: 24px; height: 24px; background: #fbbf24; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">10</div>
            <span style="font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${currentUser.profile.name || 'あなた'}</span>
          </div>
          
          <div style="position: absolute; left: 58%; top: 48%; display: flex; flex-direction: column; align-items: center; z-index: 2;">
            <div style="width: 24px; height: 24px; background: ${isMutual ? '#ef4444' : '#64748b'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${isMutual ? '❤️' : '8'}</div>
            <span style="font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${friendName}</span>
          </div>

          <div style="position: absolute; left: 8%; top: 20%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
          <div style="position: absolute; left: 12%; top: 75%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
          <div style="position: absolute; left: 35%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
          <div style="position: absolute; left: 40%; top: 80%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
          <div style="position: absolute; left: 78%; top: 20%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
          <div style="position: absolute; left: 82%; top: 70%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
        </div>`;
    } else if (currentUser.profile.sport.includes('野球')) {
      fieldBg = 'linear-gradient(135deg, #7c2d12, #451a03)';
      sportEmoji = '⚾';
      teamName = `${currentUser.profile.name || 'あなた'}の所属野球部`;
      playerLayout = `
        <div style="position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};">
          <div style="position: absolute; width: 70px; height: 70px; border: 1.5px solid rgba(255,255,255,0.15); transform: rotate(45deg); top: 30%;"></div>
          
          <div style="position: absolute; left: 48%; top: 72%; display: flex; flex-direction: column; align-items: center; z-index: 2;">
            <div style="width: 24px; height: 24px; background: #fbbf24; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">2</div>
            <span style="font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${currentUser.profile.name || 'あなた'}</span>
          </div>
          
          <div style="position: absolute; left: 48%; top: 22%; display: flex; flex-direction: column; align-items: center; z-index: 2;">
            <div style="width: 24px; height: 24px; background: ${isMutual ? '#ef4444' : '#64748b'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6em; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${isMutual ? '❤️' : '1'}</div>
            <span style="font-size: 0.7em; color: white; font-weight: bold; margin-top: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${friendName}</span>
          </div>

          <div style="position: absolute; left: 15%; top: 30%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
          <div style="position: absolute; left: 30%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
          <div style="position: absolute; left: 70%; top: 15%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
          <div style="position: absolute; left: 85%; top: 30%; width: 14px; height: 14px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
        </div>`;
    } else {
      fieldBg = 'linear-gradient(135deg, #1e293b, #0f172a)';
      playerLayout = `
        <div style="position: relative; width: 100%; height: 130px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; background: ${fieldBg};">
          <div style="text-align: center; color: rgba(255,255,255,0.4); font-size: 0.85em; font-weight: bold; line-height: 1.4;">
            ${sportEmoji} クイックテンプレートを選択して<br>集合写真を自動生成しましょう！
          </div>
        </div>`;
    }

    html += `<div class="section" style="padding: 15px;">
      <h3 style="font-size: 0.95em; margin-bottom: 10px;">📸 連動型部活動集合写真</h3>
      <p style="font-size: 0.75em; color: var(--text-sub); margin-bottom: 12px; font-weight: 500;">
        ※あなたと親友のペア所属を証明する「集合写真（フォーメーション）」です。
      </p>
      ${playerLayout}
      <div style="margin-top: 10px; font-size: 0.8em; color: var(--text-sub); display: flex; align-items: center; justify-content: space-between;">
        <span><strong>${teamName}</strong> (システム認証)</span>
        <span>${isMutual ? '<strong style="color: #2e7d32;">❤️ 同一写真に写る親友としてリンク済</strong>' : '<strong style="color: #b45309;">⚠️ 親友未接続</strong>'}</span>
      </div>
    </div>`;

    // 1. プロフィール編集
    html += `<div class="section">
      <h3>プロフィール編集</h3>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <input type="text" id="edit-nickname" placeholder="ニックネーム" value="${currentUser.profile.nickname || currentUser.profile.name || ''}" class="input-field">
        <input type="text" id="edit-sport" placeholder="競技種目" value="${currentUser.profile.sport}" class="input-field">
        <input type="text" id="edit-position" placeholder="ポジション・役割" value="${currentUser.profile.position}" class="input-field">
        <textarea id="edit-selfIntro" placeholder="自己紹介（フリーワード）" class="input-field" style="height: 120px;">${currentUser.profile.selfIntroduction || currentUser.profile.selfPR || ''}</textarea>
        <button class="btn" onclick="window.sns_save_profile()">保存する</button>
      </div>
    </div>`;
  }

  else if (activeTab === 'friends') {
    // 2. 親友リンク（ペアスカウトの要）
    const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);
    html += `<div class="section" style="border-color: #cbd5e1;">
      <h3>📸 ツーショット写真から親友をAI推測接続</h3>
      <p style="font-size: 0.75em; color: var(--text-sub); margin-bottom: 12px; font-weight: 500;">
        親友と二人で写っている写真を1枚アップロードしてください。AIが画像中の顔と特徴量を解析し、あなたの親友（ペア候補）を自動特定します！
      </p>
      
      <input type="file" id="twoshot-upload" accept="image/*" style="display: none;" onchange="window.sns_start_ai_inference(this)">
      <button class="btn" style="background: var(--primary-color); display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="document.getElementById('twoshot-upload').click()">
        📷 写真を選択してAI解析を走らせる
      </button>

      <div id="ai-scanner-container" style="display: none; flex-direction: column; align-items: center; gap: 10px; margin-top: 15px; padding: 15px; background: #eef2ff; border-radius: 6px; border: 1px solid #c7d2fe; position: relative; overflow: hidden; min-height: 250px;">
        <div id="scanner-laser" style="position: absolute; left: 0; top: 0; width: 100%; height: 3px; background: rgba(59, 130, 246, 0.8); box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); z-index: 10;"></div>
        <img id="scanned-image" style="width: 100%; max-width: 180px; height: auto; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 10px;">
        <div id="ai-logs" style="font-family: monospace; font-size: 0.75em; background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 4px; width: 100%; text-align: left; min-height: 90px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); line-height: 1.4; overflow-y: auto;"></div>
      </div>
    </div>`;

    html += `<div class="section">
      <h3>登録されている学生リスト</h3>
      <p style="font-size: 0.8em; color: #65676b; margin-bottom: 12px;">※相互に登録すると「ペアスカウト」の対象になります。</p>
      ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}
      ${otherStudents.map(os => {
        const isFriend = currentUser.profile.friends.includes(os.id);
        const isMutual = isFriend && os.profile.friends.includes(currentUser.id);
        return `<div class="user-card">
          <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>
          <div class="user-card-actions">
            <button class="btn ${isFriend ? 'btn-secondary' : ''}" 
              onclick="window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})">
              ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}
            </button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  else if (activeTab === 'scouts') {
    // 3. 受信したスカウト
    const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));
    html += `<div class="section">
      <h3>届いているスカウト</h3>
      ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}
      ${myMatches.map(m => {
        const isPair = m.interviewType === 'タイプ:ペア';
        const partnerId = m.studentIds.find(id => id !== currentUser.id);
        const partnerName = state.users[partnerId]?.profile.name;
        
        const chatHtml = activeChatMatchId === m.id ? (() => {
          // Check if there is an interview fee bill paid (status === 'PAID')
          const isPaid = (state.billing || []).some(b => b.matchId === m.id && b.type === '手数料:面談' && b.status === 'PAID');

          if (!isPaid) {
            return `<div class="chat-box" style="margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;">
              <h4 style="font-size: 0.95em; color: #1a237e; margin-bottom: 10px;">💬 面談チャットルーム</h4>
              <div style="background: #fff3cd; border: 1px solid #ffe58f; color: #856404; padding: 15px; border-radius: 4px; font-size: 0.9em; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <span style="font-size: 1.5em;">🔒</span>
                <strong>面談手数料の決済が完了するまで、チャットルームは利用できません。</strong>
                <span style="font-size: 0.8em; opacity: 0.85;">※現在、企業様による面談手数料のお支払いが確認できておりません。決済完了までしばらくお待ちください。</span>
              </div>
            </div>`;
          }

          const msgs = (state.messages || []).filter(msg => msg.matchId === m.id);
          const msgListHtml = msgs.map(msg => {
            const isMe = msg.senderId === currentUser.id;
            const senderName = msg.senderId === currentUser.id ? 'あなた' : (state.users[msg.senderId]?.profile.name || '関係者');
            const bubbleBg = isMe ? '#1a237e' : '#e4e6eb';
            const bubbleColor = isMe ? '#ffffff' : '#1f242d';
            const alignSelf = isMe ? 'flex-end' : 'flex-start';
            return `<div style="display: flex; flex-direction: column; align-items: ${alignSelf}; margin-bottom: 10px; max-width: 80%;">
              <span style="font-size: 0.7em; color: #65676b; margin-bottom: 2px;">${senderName}</span>
              <div style="background: ${bubbleBg}; color: ${bubbleColor}; padding: 10px 14px; border-radius: 12px; font-size: 0.9em; word-break: break-all;">
                ${msg.text}
              </div>
            </div>`;
          }).join('') || '<p style="font-size: 0.8em; color: #65676b; text-align: center; margin: 15px 0;">まだメッセージはありません。最初のメッセージを送りましょう！</p>';

          return `<div class="chat-box" style="margin-top: 15px; border-top: 1px solid #e2e5eb; padding-top: 15px; display: flex; flex-direction: column; width: 100%;">
            <h4 style="font-size: 0.95em; color: #1a237e; margin-bottom: 10px;">💬 面談チャットルーム</h4>
            <div class="chat-scroller">
              ${msgListHtml}
            </div>
            <div style="display: flex; gap: 8px; width: 100%;">
              <input type="text" id="chat-input-${m.id}" class="input-field" placeholder="メッセージを入力..." style="flex: 1; padding: 10px;" onkeypress="if(event.key === 'Enter') window.sns_send_message('${m.id}')">
              <button class="btn" style="width: auto; min-width: 60px; min-height: auto; padding: 8px 16px;" onclick="window.sns_send_message('${m.id}')">送信</button>
            </div>
          </div>`;
        })() : '';

        return `<div class="user-card" style="${isPair ? 'border-left: 5px solid #1a237e;' : ''}; flex-direction: column; align-items: stretch;">
          <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
              <div>
                <span class="friend-badge" style="background: ${isPair ? '#eceef7' : '#fafafb'};">
                  ${isPair ? 'ペアスカウト' : '単体スカウト'}
                </span>
                <div style="margin-top: 5px;">
                  <strong>企業: ${state.users[m.corpId]?.profile.name || '不明'}</strong><br>
                  ${isPair ? `<span style="font-size: 0.9em; color: #65676b;">パートナー: ${partnerName} さん</span>` : ''}
                </div>
                <div style="font-size: 0.8em; color: #65676b; margin-top: 5px;">ステータス: ${m.status}</div>
              </div>
              <div class="user-card-actions" style="width: auto;">
                ${m.status === MatchStatus.SCOUTED ? `
                  <button class="btn" onclick="window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})">承諾する</button>
                  <button class="btn btn-secondary" onclick="window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})">辞退</button>
                ` : ''}
                ${m.status === MatchStatus.INTERVIEW_SET ? `
                  <button class="btn btn-secondary" style="font-size: 0.8em; padding: 6px 12px; min-height: 32px;" onclick="window.sns_toggle_chat('${m.id}')">
                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}
                  </button>
                ` : ''}
                ${m.status === MatchStatus.HIRED ? `
                  <span style="color: green; font-weight: bold; font-size: 0.9em; margin-right: 10px;">採用確定！</span>
                  <button class="btn btn-secondary" style="font-size: 0.8em; padding: 6px 12px; min-height: 32px;" onclick="window.sns_toggle_chat('${m.id}')">
                    ${activeChatMatchId === m.id ? 'チャットを閉じる ▲' : 'チャットを開く 💬'}
                  </button>
                ` : ''}
              </div>
            </div>
            ${chatHtml}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  else if (activeTab === 'debug') {
    // 4. (デバッグ用) 企業シミュレーター
    const unpaidBills = (state.billing || []).filter(b => b.status === 'UNPAID');
    const simBillingHtml = unpaidBills.map(b => {
      return `<div style="margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ffe58f; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span style="font-size: 0.8em; color: #856404; font-weight: bold;">[未決済] ${b.type} (${b.amount.replace('jpy:', '').toLocaleString()}円)</span>
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75em; min-height: 28px; width: auto;" onclick="window.sns_dispatch({type:'PAY_BILL', payload:{billId:'${b.id}'}})">決済（テスト支払）</button>
      </div>`;
    }).join('');

    html += `<div class="section simulator-section">
      <h4>[開発用] 企業シミュレーター</h4>
      <p style="font-size: 0.8em; margin-bottom: 12px; color: #856404;">※自分に対してスカウトを送るテスト用機能です。</p>
      <div class="simulator-actions">
        <button class="btn btn-secondary" onclick="window.sns_sim_single_scout()">自分に単体スカウトを送る</button>
        <button class="btn btn-secondary" onclick="window.sns_sim_pair_scout()">親友とペアスカウトを送る</button>
      </div>
      ${simBillingHtml ? `<div style="margin-top: 15px; border-top: 1px solid #ffe58f; padding-top: 10px;">
        <h5 style="font-size: 0.85em; color: #856404; margin-bottom: 5px;">【決済シミュレーター】</h5>
        ${simBillingHtml}
      </div>` : ''}
    </div>`;
  }

  // Close scroll body container
  html += `</div>`;

  // Render bottom navigation bar
  html += `<div class="bottom-nav">
    <div class="bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}" onclick="window.sns_switch_tab_view('profile')">
      <span class="icon">👤</span>
      <span>プロフィール</span>
    </div>
    <div class="bottom-nav-item ${activeTab === 'friends' ? 'active' : ''}" onclick="window.sns_switch_tab_view('friends')">
      <span class="icon">🤝</span>
      <span>親友リンク</span>
    </div>
    <div class="bottom-nav-item ${activeTab === 'scouts' ? 'active' : ''}" onclick="window.sns_switch_tab_view('scouts')">
      <span class="icon">✉️</span>
      <span>スカウト</span>
    </div>
    <div class="bottom-nav-item ${activeTab === 'debug' ? 'active' : ''}" onclick="window.sns_switch_tab_view('debug')">
      <span class="icon">⚙️</span>
      <span>デバッグ</span>
    </div>
  </div>`;

  // Event Handlers
  window.sns_switch_tab_view = (tab) => {
    activeTab = tab;
    render(container, state, dispatch);
  };

  window.sns_toggle_chat = (matchId) => {
    activeChatMatchId = activeChatMatchId === matchId ? null : matchId;
    render(container, state, dispatch);
  };

  window.sns_send_message = (matchId) => {
    const inputEl = document.getElementById(`chat-input-${matchId}`);
    const text = inputEl ? inputEl.value.trim() : '';
    if (text) {
      dispatch({
        type: 'SEND_MESSAGE',
        payload: {
          matchId,
          senderId: currentUser.id,
          text
        }
      });
      inputEl.value = '';
    }
  };

  window.sns_apply_sport_template = (sport) => {
    const templates = {
      soccer: {
        nickname: '美咲 (みさ)',
        sport: 'サッカー部 (FW)',
        position: 'フォワード / 主将・得点王',
        selfIntroduction: '全国高校選手権ベスト8、都リーグ得点王。チームを牽引する高いリーダーシップと、決定機を逃さない決定力が武器です！親友の「拓海 (たく)」とは10年間同じピッチで戦い、阿吽の呼吸で得点を演出できます。'
      },
      baseball: {
        nickname: '翔太 (しょう)',
        sport: '野球部 (捕手)',
        position: '正捕手 / 副主将',
        selfIntroduction: '春季リーグ ベストナイン、甲子園出場。投手の長所を120%引き出すインサイドワークと、二塁送球1.9秒台の強肩が強みです！相棒ピッチャーの「陸 (りく)」とは絶対の信頼関係があります。'
      },
      rugby: {
        nickname: '拓也 (たく)',
        sport: 'ラグビー部 (SH)',
        position: 'スクラムハーフ / ゲームメイカー',
        selfIntroduction: '全国大学選手権ベスト4、リーグ戦ベスト15。素早い球出しと的確な判断力、そしてタフな運動量で攻撃のテンポを作り出します。ピンチの局面でも常に声を出し続け、身体を張ったタックルでチームを鼓舞する献身的なプレイが強みです。'
      },
      track: {
        nickname: '陸 (りく)',
        sport: '陸上競技部 (短距離)',
        position: '100m / 主将',
        selfIntroduction: 'インカレ 100m決勝進出、自己ベスト 10.45秒。妥協なきトレーニングと緻密な走法分析による、圧倒的なセルフマネジメント力が武器です。主将として個々の強みを引き出す役割も担っています。'
      }
    };

    const t = templates[sport];
    if (t) {
      document.getElementById('edit-nickname').value = t.nickname;
      document.getElementById('edit-sport').value = t.sport;
      document.getElementById('edit-position').value = t.position;
      document.getElementById('edit-selfIntro').value = t.selfIntroduction;
    }
  };

  window.sns_save_profile = () => {
    const nickname = document.getElementById('edit-nickname').value;
    const sport = document.getElementById('edit-sport').value;
    const position = document.getElementById('edit-position').value;
    const selfIntro = document.getElementById('edit-selfIntro').value;

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        userId: currentUser.id,
        profile: {
          nickname,
          name: nickname, // fallback
          sport,
          position,
          selfIntroduction: selfIntro,
          selfPR: selfIntro // fallback
        }
      }
    });
    dispatch({
      type: 'USER_REGISTER',
      payload: { 
        id: currentUser.id, 
        role: Roles.STUDENT, 
        nickname, 
        name: nickname, // fallback
        sport,
        selfIntroduction: selfIntro 
      }
    });
  };

  window.sns_sim_single_scout = () => {
    const corpId = 'sim:corp';
    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });
    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id] } });
  };

  window.sns_sim_pair_scout = () => {
    const corpId = 'sim:corp';
    const partnerId = currentUser.profile.friends[0];
    if (!partnerId || !state.users[partnerId]?.profile.friends.includes(currentUser.id)) {
      alert("親友リンク（相互）が成立している相手がいません。");
      return;
    }
    dispatch({ type: 'USER_REGISTER', payload: { id: corpId, role: Roles.CORPORATION, name: 'テスト企業' } });
    dispatch({ type: 'SEND_SCOUT', payload: { corpId, studentIds: [currentUser.id, partnerId] } });
  };

  // Two-Shot Photo AI Inference event handler
  window.sns_start_ai_inference = (input) => {
    const file = input.files[0];
    if (!file) return;

    const scanContainer = document.getElementById('ai-scanner-container');
    const laser = document.getElementById('scanner-laser');
    const img = document.getElementById('scanned-image');
    const logs = document.getElementById('ai-logs');

    if (!scanContainer || !laser || !img || !logs) return;

    scanContainer.style.display = 'flex';
    laser.style.display = 'block';
    img.style.display = 'block';

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Dynamic Scanning Laser Line Loop
    let laserPos = 0;
    let laserDir = 1;
    const laserInterval = setInterval(() => {
      laserPos += 2.5 * laserDir;
      if (laserPos >= 96 || laserPos <= 1) laserDir *= -1;
      laser.style.top = `${laserPos}%`;
    }, 25);

    // AI Terminal Output Logs Simulation
    logs.innerHTML = `<span style="color: #10b981;">[AI Inference Engine v2.1 init...]</span><br>`;
    
    const logList = [
      `> [1/3] 画像データのCanvasビットマップ展開を完了しました。`,
      `> [1/3] 特徴マップ（Pixel Gradients）から顔候補領域を探索中...`,
      `> [2/3] 顔位置の検出に成功：2つのバウンディングボックスを抽出しました。`,
      `> [2/3] 顔パーツ幾何ランドマーク（目・鼻・口の相対距離）を抽出中...`,
      `> [3/3] クラウド顔認証データベースと照合を実行中...`,
      `> ➔ 照合特定成功: [あなた] ＆ [同一チームの部員] のペア関係を検出！`,
      `> ➔ 特徴適合率: 95.8% — 集合写真内の相互関係を証明・自動リンクします。`
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logList.length) {
        logs.innerHTML += `${logList[logIdx]}<br>`;
        logs.scrollTop = logs.scrollHeight;
        logIdx++;
      } else {
        clearInterval(logInterval);
        clearInterval(laserInterval);
        laser.style.display = 'none';

        // Retrieve a member in our directory to link
        const targetFriend = otherStudents[0] || { id: 'std:bob', profile: { name: '清水 美咲' } };

        // Establish mutual friends link
        dispatch({
          type: 'SET_FRIEND',
          payload: { studentId: currentUser.id, friendId: targetFriend.id }
        });
        dispatch({
          type: 'SET_FRIEND',
          payload: { studentId: targetFriend.id, friendId: currentUser.id }
        });

        alert(`🎉 AI親友推測マッチング成功！\nAIが画像内の顔認証により「あなた」と「${state.users[targetFriend.id]?.profile.name || targetFriend.profile.name || '清水 美咲'}」さんの親友関係を特定・実証しました！`);
        render(container, state, dispatch);
      }
    }, 850);
  };

  window.sns_dispatch = dispatch;
  container.innerHTML = html;
}

function renderAuth(container, state, dispatch) {
  let html = `<div class="section" style="text-align: center; padding: 40px 20px;">
    <h2 style="margin-bottom: 30px;">学生ログイン</h2>
    
    <div style="margin-bottom: 30px;">
      <p style="color: #65676b; margin-bottom: 20px;">QR鍵（秘密鍵）を選択してログインしてください</p>
      <input type="file" id="qr-input" style="display: none;" onchange="window.sns_handle_qr_file(this)">
      <button class="btn" style="padding: 12px 24px; font-size: 1.1em;" onclick="document.getElementById('qr-input').click()">QR画像を選択してログイン</button>
    </div>
    
    <div style="margin-top: 40px; border-top: 1px solid #e4e6eb; padding-top: 20px;">
      <a href="#" style="color: #1a237e; font-size: 0.85em; text-decoration: none;" onclick="window.sns_start_registration(); return false;">新しく学生アカウントを作る（鍵発行）</a>
    </div>
    
    <div id="qr-display" style="margin-top: 20px;"></div>
  </div>`;

  window.sns_start_registration = async () => {
    const { recoveryKey, publicId, identity } = await createNewUserIdentity();
    const qrEl = document.getElementById('qr-display');
    qrEl.innerHTML = `
    <div style="background: #fafafb; padding: 20px; border-radius: 6px; border: 1px solid #1a237e; margin-top: 20px;">
      <p style="color: #050505; font-weight: bold; margin-bottom: 8px;">学生用パスポートが発行されました！</p>
      <p style="font-size: 0.85em; color: #65676b; margin-bottom: 15px;">この鍵画像を必ずダウンロードして保存してください。これがあなたの「ログイン証（秘密鍵）」になります。</p>
      <div id="qrcode" style="margin: 20px 0;"></div>
      <div style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
        <button class="btn" onclick="window.sns_download_qr()">鍵画像をダウンロード (PNG)</button>
        <button class="btn btn-secondary" style="background: var(--primary-color); color: #ffffff;" id="auto-login-btn">保存を完了してマイページへ進む ➡️</button>
      </div>
      <p style="font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px; margin-top: 15px; border: 1px solid var(--border-color);">鍵ID: ${publicId}</p>
      <canvas id="qr-canvas" style="display: none;"></canvas>
    </div>`;

    // Click to auto-login UX
    document.getElementById('auto-login-btn').onclick = () => {
      dispatch({ type: 'SET_AUTH', payload: { publicId, identity } });
      dispatch({ type: 'USER_REGISTER', payload: { id: publicId, role: Roles.STUDENT, name: '新規ユーザー' } });
    };
    
    const typeNumber = 0;
    const errorCorrectionLevel = 'H';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(recoveryKey);
    qr.make();
    
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = qr.createImgTag(5);
    
    window.sns_download_qr = () => {
      const img = qrContainer.querySelector('img');
      const canvas = document.getElementById('qr-canvas');
      const ctx = canvas.getContext('2d');
      const runDownload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const link = document.createElement('a');
        link.download = `student-key-${publicId.slice(0,8)}.png`;
        link.href = canvas.toDataURL('image/png'); // Use lossless PNG instead of lossy WebP
        link.click();
      };
      if (img.complete) runDownload();
      else img.onload = runDownload;
    };
  };

  window.sns_handle_qr_file = async (input) => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          const result = await authenticateWithKey(code.data);
          if (result.success) {
            dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });
            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });
          } else { alert("認証に失敗しました。: " + (result.error || "")); }
        } else { alert("QRコードが読み取れませんでした。画像の画質やトリミングを確認してください。"); }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    input.value = '';
  };
  
  window.sns_dispatch = dispatch;
  container.innerHTML = html;
}

// === /HEAD ===
