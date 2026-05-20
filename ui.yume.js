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
    ]
  }
};

// === HEAD ===

import { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';
import { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';

export function render(container, state, dispatch) {
  if (!state.REAL_auth) {
    renderAuth(container, state, dispatch);
    return;
  }

  const currentUser = state.users[state.REAL_auth.publicId] || {
    id: state.REAL_auth.publicId,
    role: Roles.STUDENT,
    profile: { name: '新規ユーザー', sport: '', position: '', achievements: '', selfPR: '', friends: [] }
  };

  let html = `<div class="mypage-header">
    <h2>マイページ</h2>
    <div class="mypage-header-right">
      <span>ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>
      <button class="btn btn-secondary" onclick="window.sns_dispatch({type:'SET_AUTH', payload:null})">ログアウト</button>
    </div>
  </div>`;

  // 1. プロフィール編集
  html += `<div class="section">
    <h3>プロフィール編集</h3>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <input type="text" id="edit-name" placeholder="氏名" value="${currentUser.profile.name}" class="input-field">
      <input type="text" id="edit-sport" placeholder="競技種目" value="${currentUser.profile.sport}" class="input-field">
      <input type="text" id="edit-position" placeholder="ポジション・役割" value="${currentUser.profile.position}" class="input-field">
      <textarea id="edit-achievements" placeholder="競技実績" class="input-field" style="height: 60px;">${currentUser.profile.achievements}</textarea>
      <textarea id="edit-selfPR" placeholder="自己PR" class="input-field" style="height: 100px;">${currentUser.profile.selfPR}</textarea>
      <button class="btn" onclick="window.sns_save_profile()">保存する</button>
    </div>
  </div>`;

  // 2. 親友リンク（ペアスカウトの要）
  const otherStudents = Object.values(state.users).filter(u => u.id !== currentUser.id && u.role === Roles.STUDENT);
  html += `<div class="section">
    <h3>親友リンク</h3>
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

  // 3. 受信したスカウト
  const myMatches = Object.values(state.matches).filter(m => m.studentIds.includes(currentUser.id));
  html += `<div class="section">
    <h3>届いているスカウト</h3>
    ${myMatches.length === 0 ? '<p>まだスカウトは届いていません。</p>' : ''}
    ${myMatches.map(m => {
      const isPair = m.interviewType === 'タイプ:ペア';
      const partnerId = m.studentIds.find(id => id !== currentUser.id);
      const partnerName = state.users[partnerId]?.profile.name;
      
      return `<div class="user-card" style="${isPair ? 'border-left: 5px solid #1a237e;' : ''}">
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
        <div class="user-card-actions">
          ${m.status === MatchStatus.SCOUTED ? `
            <button class="btn" onclick="window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})">承諾する</button>
            <button class="btn btn-secondary" onclick="window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})">辞退</button>
          ` : ''}
          ${m.status === MatchStatus.INTERVIEW_SET ? '<span style="color: #1a237e; font-weight: bold; font-size: 0.9em;">面談進行中</span>' : ''}
          ${m.status === MatchStatus.HIRED ? '<span style="color: green; font-weight: bold; font-size: 0.9em;">採用確定！</span>' : ''}
        </div>
      </div>`;
    }).join('')}
  </div>`;

  // 4. (デバッグ用) 企業シミュレーター
  html += `<div class="section simulator-section">
    <h4>[開発用] 企業シミュレーター</h4>
    <p style="font-size: 0.8em; margin-bottom: 12px; color: #856404;">※自分に対してスカウトを送るテスト用機能です。</p>
    <div class="simulator-actions">
      <button class="btn btn-secondary" onclick="window.sns_sim_single_scout()">自分に単体スカウトを送る</button>
      <button class="btn btn-secondary" onclick="window.sns_sim_pair_scout()">親友とペアスカウトを送る</button>
    </div>
  </div>`;

  // Event Handlers
  window.sns_save_profile = () => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        userId: currentUser.id,
        profile: {
          name: document.getElementById('edit-name').value,
          sport: document.getElementById('edit-sport').value,
          position: document.getElementById('edit-position').value,
          achievements: document.getElementById('edit-achievements').value,
          selfPR: document.getElementById('edit-selfPR').value
        }
      }
    });
    // Ensure user exists in state for simulator
    dispatch({
      type: 'USER_REGISTER',
      payload: { id: currentUser.id, role: Roles.STUDENT, name: document.getElementById('edit-name').value, sport: document.getElementById('edit-sport').value }
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
    <div style="background: #fafafb; padding: 20px; border-radius: 0; border: 1px solid #1a237e; margin-top: 20px;">
      <p style="color: #050505; font-weight: bold;">学生用パスポートが発行されました！</p>
      <p style="font-size: 0.9em; color: #65676b;">この鍵画像を保存してください。これがあなたの「ログイン証」になります。</p>
      <div id="qrcode" style="margin: 20px 0;"></div>
      <div style="margin-bottom: 20px;">
        <button class="btn" onclick="window.sns_download_qr()">鍵画像をダウンロード</button>
      </div>
      <p style="font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px;">鍵ID: ${publicId}</p>
      <div style="margin-top: 20px;">
        <button class="btn btn-secondary" onclick="location.reload()">ログイン画面に戻る</button>
      </div>
      <canvas id="qr-canvas" style="display: none;"></canvas>
    </div>`;
    
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
        link.download = `student-key-${publicId.slice(0,8)}.webp`;
        link.href = canvas.toDataURL('image/webp');
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
            // Ensure student is registered if new
            dispatch({ type: 'USER_REGISTER', payload: { id: result.publicId, role: Roles.STUDENT, name: '未設定' } });
          } else { alert("認証に失敗しました。"); }
        } else { alert("QRコードが読み取れませんでした。"); }
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
