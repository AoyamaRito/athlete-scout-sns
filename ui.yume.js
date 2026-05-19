// @yume-format: 1
/**
 * ui.yume.js - Rendering Logic (SHADOW views from REAL_state)
 * @tags: ui, render
 */

import { Roles, MatchStatus, checkPairEligibility } from './BIBLE.js';

export const __block = {
  id: 'sns:ui',
  type: 'module',
  versions: [{ hash: 'initial', content: '', ts: Date.now(), refs: [], tags: ['ui'] }]
};

// === HEAD ===

export function render(container, state, dispatch) {
  const users = Object.values(state.users);
  const students = users.filter(u => u.role === Roles.STUDENT);
  const corps = users.filter(u => u.role === Roles.CORPORATION);

  let html = '';

  // 1. Student Perspective Simulation
  html += `<div class="section">
    <h2>Student View (Simulation)</h2>`;
  
  students.forEach(s => {
    const otherStudents = students.filter(os => os.id !== s.id);
    html += `<div class="user-card">
      <div>
        <strong>${s.profile.name}</strong> (${s.profile.sport})<br>
        Friends: ${s.profile.friends.join(', ') || 'None'}
      </div>
      <div>
        ${otherStudents.map(os => {
          const isFriend = s.profile.friends.includes(os.id);
          const isMutual = isFriend && os.profile.friends.includes(s.id);
          return `<button class="btn ${isFriend ? 'btn-secondary' : ''}" 
            onclick="window.sns_dispatch({type:'SET_FRIEND', payload:{studentId:'${s.id}', friendId:'${os.id}'}})">
            ${isFriend ? (isMutual ? 'Mutual Friend ❤️' : 'Request Sent') : 'Set Best Friend'}
          </button>`;
        }).join('')}
      </div>
    </div>`;
  });
  html += `</div>`;

  // 2. Corp Perspective Simulation
  html += `<div class="section">
    <h2>Corporate View (Scouting)</h2>`;
  
  corps.forEach(c => {
    html += `<h3>Corp: ${c.profile.name}</h3>`;
    
    // Pair Discovery
    html += `<h4>Pair Discovery</h4>`;
    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const s1 = students[i];
        const s2 = students[j];
        const isEligible = checkPairEligibility(s1, s2);
        
        if (isEligible) {
          html += `<div class="user-card" style="border-color: #1877f2; background: #f0f7ff;">
            <div>
              <strong>Perfect Pair: ${s1.profile.name} & ${s2.profile.name}</strong><br>
              Mutual Best Friends in ${s1.profile.sport}!
            </div>
            <button class="btn" onclick="window.sns_dispatch({type:'SEND_SCOUT', payload:{corpId:'${c.id}', studentIds:['${s1.id}', '${s2.id}']}})">
              Send Pair Scout
            </button>
          </div>`;
        }
      }
    }

    // Matches
    html += `<h4>Active Matches</h4>`;
    const myMatches = Object.values(state.matches).filter(m => m.corpId === c.id);
    if (myMatches.length === 0) html += `<p>No scouts sent yet.</p>`;
    
    myMatches.forEach(m => {
      const names = m.studentIds.map(id => state.users[id]?.profile.name).join(' & ');
      html += `<div class="user-card">
        <div>
          <strong>Match: ${names}</strong><br>
          Status: <code>${m.status}</code> (${m.interviewType})
        </div>
        <div>
          ${m.status === MatchStatus.SCOUTED ? 
            `<button class="btn" onclick="window.sns_dispatch({type:'SET_INTERVIEW', payload:{matchId:'${m.id}'}})">Set Interview</button>` : ''}
          ${m.status === MatchStatus.INTERVIEW_SET ? 
            `<button class="btn" onclick="window.sns_dispatch({type:'MARK_HIRED', payload:{matchId:'${m.id}'}})">Mark Hired</button>` : ''}
          ${m.status === MatchStatus.HIRED ? '<span style="color: green; font-weight: bold;">Hired!</span>' : ''}
        </div>
      </div>`;
    });
  });
  html += `</div>`;

  // Exposed for inline onclicks (Simplified for prototype)
  window.sns_dispatch = dispatch;
  container.innerHTML = html;
}

// === /HEAD ===
