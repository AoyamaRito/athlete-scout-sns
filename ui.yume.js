// @yume-format: 1
/**
 * ui.yume.js - レンダリングロジック（日本語 & QR認証対応）
 * @tags: ui, render
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

  const users = Object.values(state.users);
  const students = users.filter(u => u.role === Roles.STUDENT);
  const corps = users.filter(u => u.role === Roles.CORPORATION);

  let html = `<div style="margin-bottom: 20px; text-align: right;">
    <span>ログイン中ID: <code>${state.REAL_auth.publicId.slice(0, 8)}...</code></span>
    <button class="btn btn-secondary" onclick="window.sns_dispatch({type:'SET_AUTH', payload:null})">ログアウト</button>
  </div>`;

  // 1. 学生視点
  html += `<div class="section">
    <h2>学生プロフィール (シミュレーション)</h2>`;
  
  students.forEach(s => {
    const otherStudents = students.filter(os => os.id !== s.id);
    html += `<div class="user-card">
      <div>
        <strong>${s.profile.name}</strong> (${s.profile.sport})<br>
        親友リスト: ${s.profile.friends.map(id => state.users[id]?.profile.name).join(', ') || 'なし'}
      </div>
      <div>
        ${otherStudents.map(os => {
          const isFriend = s.profile.friends.includes(os.id);
          const isMutual = isFriend && os.profile.friends.includes(s.id);
          return `<button class="btn ${isFriend ? 'btn-secondary' : ''}" 
            onclick="window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${s.id}', friendId:'${os.id}'}})">
            ${isFriend ? (isMutual ? '親友（相互） ❤️' : '申請中') : '親友に設定'}
          </button>`;
        }).join('')}
      </div>
    </div>`;
  });
  html += `</div>`;

  // 2. 企業視点
  html += `<div class="section">
    <h2>企業スカウト画面</h2>`;
  
  corps.forEach(c => {
    html += `<h3>企業名: ${c.profile.name}</h3>`;
    
    // ペア発見
    html += `<h4>仲良しペアを発見</h4>`;
    let pairCount = 0;
    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const s1 = students[i];
        const s2 = students[j];
        if (checkPairEligibility(s1, s2)) {
          pairCount++;
          html += `<div class="user-card" style="border-color: #1877f2; background: #f0f7ff;">
            <div>
              <strong>注目ペア: ${s1.profile.name} ＆ ${s2.profile.name}</strong><br>
              ${s1.profile.sport}部の親友同士です！
            </div>
            <button class="btn" onclick="window.sns_dispatch({type:'SEND_SCOUT', payload:{corpId:'${c.id}', studentIds:['${s1.id}', '${s2.id}']}})">
              二人まとめてスカウト
            </button>
          </div>`;
        }
      }
    }
    if (pairCount === 0) html += `<p>現在、親友リンク済みのペアはいません。</p>`;

    // マッチング状況
    html += `<h4>スカウト・選考状況</h4>`;
    const myMatches = Object.values(state.matches).filter(m => m.corpId === c.id);
    if (myMatches.length === 0) html += `<p>スカウト履歴はありません。</p>`;
    
    myMatches.forEach(m => {
      const names = m.studentIds.map(id => state.users[id]?.profile.name).join(' ＆ ');
      html += `<div class="user-card">
        <div>
          <strong>${names}</strong><br>
          現在のステータス: <code>${m.status}</code> (${m.interviewType})
        </div>
        <div>
          ${m.status === MatchStatus.SCOUTED ? 
            `<button class="btn" onclick="window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})">面談を確定する</button>` : ''}
          ${m.status === MatchStatus.INTERVIEW_SET ? 
            `<button class="btn" onclick="window.sns_dispatch({type:'MARK_HIRED', payload:{matchId:'${m.id}'}})">採用を確定する</button>` : ''}
          ${m.status === MatchStatus.HIRED ? '<span style="color: green; font-weight: bold;">内定・承諾済み</span>' : ''}
        </div>
      </div>`;
    });
  });
  html += `</div>`;

  window.sns_dispatch = dispatch;
  container.innerHTML = html;
}

function renderAuth(container, state, dispatch) {
  let html = `<div class="section" style="text-align: center; padding: 40px 20px;">
    <h2 style="margin-bottom: 30px;">ログイン</h2>
    
    <div style="margin-bottom: 30px;">
      <p style="color: #65676b; margin-bottom: 20px;">QR鍵（秘密鍵）を選択して認証してください</p>
      <input type="file" id="qr-input" style="display: none;" onchange="window.sns_handle_qr_file(this)">
      <button class="btn" style="padding: 12px 24px; font-size: 1.1em;" onclick="document.getElementById('qr-input').click()">QR画像(鍵)を選択してログイン</button>
    </div>
    
    <div style="margin-top: 40px; border-top: 1px solid #e4e6eb; pt: 20px;">
      <a href="#" style="color: #1877f2; font-size: 0.85em; text-decoration: none;" onclick="window.sns_start_registration(); return false;">鍵をお持ちでない方はこちら（新規発行）</a>
    </div>
    
    <div id="qr-display" style="margin-top: 20px;"></div>
  </div>`;

  window.sns_start_registration = async () => {
    const { recoveryKey, publicId, identity } = await createNewUserIdentity();
    const qrEl = document.getElementById('qr-display');
    qrEl.innerHTML = `
    <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; border: 1px solid #1877f2; margin-top: 20px;">
      <p style="color: #050505; font-weight: bold;">新しい鍵が発行されました！</p>
      <p style="font-size: 0.9em; color: #65676b;">この鍵（画像）をダウンロードして大切に保管してください。</p>
      <div id="qrcode" style="margin: 20px 0;"></div>
      <div style="margin-bottom: 20px;">
        <button class="btn" onclick="window.sns_download_qr()">鍵をWebP画像として保存</button>
      </div>
      <p style="font-size: 0.7em; word-break: break-all; color: #8a8d91; background: #fff; padding: 10px; border-radius: 4px;">鍵文字列: ${recoveryKey}</p>
      <div style="margin-top: 20px;">
        <button class="btn btn-secondary" onclick="location.reload()">ログイン画面に戻る</button>
      </div>
      <canvas id="qr-canvas" style="display: none;"></canvas>
    </div>`;
    
    // Generate QR using vendor library
    const typeNumber = 0;
    const errorCorrectionLevel = 'H';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(recoveryKey);
    qr.make();
    
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = qr.createImgTag(5);
    
    // Download logic
    window.sns_download_qr = () => {
      const img = qrContainer.querySelector('img');
      const canvas = document.getElementById('qr-canvas');
      const ctx = canvas.getContext('2d');
      
      // Ensure image is loaded
      const runDownload = () => {
        canvas.width = img.width + 40; // Add padding
        canvas.height = img.height + 40;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        const link = document.createElement('a');
        link.download = `athlete-sns-key-${publicId.slice(0,8)}.webp`;
        link.href = canvas.toDataURL('image/webp');
        link.click();
      };
      
      if (img.complete) runDownload();
      else img.onload = runDownload;
    };
  };

  window.sns_handle_qr_file = async (input) => {
    // Note: Since we don't have a real QR scanner here, we'll prompt for the string
    // In a real app, this would use a JS QR reader library on the uploaded image.
    const key = prompt("QR画像をスキャンした内容（鍵文字列）を入力してください:");
    if (key) {
      const result = await authenticateWithKey(key);
      if (result.success) {
        dispatch({ type: 'SET_AUTH', payload: { publicId: result.publicId, identity: result.identity } });
      } else {
        alert("認証に失敗しました: " + result.error);
      }
    }
  };

  window.sns_dispatch = dispatch;
  container.innerHTML = html;
}

// === /HEAD ===
