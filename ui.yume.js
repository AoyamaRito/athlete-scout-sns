// @yume-format: 1
/**
 * ui.yume.js - レンダリングロジック（学生特化型）
 * @tags: ui, render, student-focus
 */

import { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';
import { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';

export const __block = {
  id: 'sns:ui',
  type: 'module',
  versions: [{ hash: 'initial', content: '', ts: Date.now(), refs: [], tags: ['ui'] }]
};

// === HEAD ===

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

  let html = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
    <h2 style="margin: 0;">マイページ</h2>
    <div>
      <span style="font-size: 0.8em; color: #65676b;">ID: ${state.REAL_auth.publicId.slice(0, 8)}...</span>
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
    <p style="font-size: 0.8em; color: #65676b;">※相互に登録すると「ペアスカウト」の対象になります。</p>
    ${otherStudents.length === 0 ? '<p>他の学生ユーザーがまだいません。</p>' : ''}
    ${otherStudents.map(os => {
      const isFriend = currentUser.profile.friends.includes(os.id);
      const isMutual = isFriend && os.profile.friends.includes(currentUser.id);
      return `<div class="user-card">
        <div><strong>${os.profile.name}</strong> (${os.profile.sport})</div>
        <button class="btn ${isFriend ? 'btn-secondary' : ''}" 
          onclick="window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${currentUser.id}', friendId:'${os.id}'}})">
          ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}
        </button>
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
        <div>
          ${m.status === MatchStatus.SCOUTED ? `
            <button class="btn" onclick="window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})">承諾する</button>
            <button class="btn btn-secondary" style="margin-left: 5px;" onclick="window.sns_dispatch({type:'REJECT_SCOUT', payload:{matchId:'${m.id}'}})">辞退</button>
          ` : ''}
          ${m.status === MatchStatus.INTERVIEW_SET ? '<span style="color: #1a237e; font-weight: bold;">面談進行中</span>' : ''}
          ${m.status === MatchStatus.HIRED ? '<span style="color: green; font-weight: bold;">採用確定！</span>' : ''}
        </div>
      </div>`;
    }).join('')}
  </div>`;

  // 4. (デバッグ用) 企業シミュレーター
  html += `<div class="section" style="background: #fff9e6; border-color: #ffe58f;">
    <h4 style="margin-top: 0;">[開発用] 企業シミュレーター</h4>
    <p style="font-size: 0.8em;">※自分に対してスカウトを送るテスト用機能です。</p>
    <button class="btn btn-secondary" onclick="window.sns_sim_single_scout()">自分に単体スカウトを送る</button>
    <button class="btn btn-secondary" onclick="window.sns_sim_pair_scout()" style="margin-left: 10px;">親友とペアスカウトを送る</button>
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
