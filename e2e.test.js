// @yume-format: 1
/**
 * e2e.test.js - Scenario-based Verification
 * @tags: test, e2e
 */

import assert from 'node:assert';
import { store, dispatch } from './logic.yume.js';
import { Roles, MatchStatus } from './BIBLE.js';

async function runTest() {
  console.log('--- Starting E2E Test: Pair Scout to Hire ---');

  // 1. Register Students
  dispatch({ type: 'USER_REGISTER', payload: { id: 'std:1', role: Roles.STUDENT, name: 'Alice', sport: 'Soccer' } });
  dispatch({ type: 'USER_REGISTER', payload: { id: 'std:2', role: Roles.STUDENT, name: 'Bob', sport: 'Soccer' } });
  
  // 2. Set mutual friends
  dispatch({ type: 'SET_FRIEND', payload: { studentId: 'std:1', friendId: 'std:2' } });
  dispatch({ type: 'SET_FRIEND', payload: { studentId: 'std:2', friendId: 'std:1' } });

  // 3. Register Corp
  dispatch({ type: 'USER_REGISTER', payload: { id: 'corp:1', role: Roles.CORPORATION, name: 'MegaCorp' } });

  // 4. Send Pair Scout
  const successScout = dispatch({ 
    type: 'SEND_SCOUT', 
    payload: { corpId: 'corp:1', studentIds: ['std:1', 'std:2'] } 
  });
  assert.strictEqual(successScout, true, 'Pair scout should be successful for mutual friends');

  const matchId = 'match:corp:1:std:1-std:2';
  assert.ok(store.REAL_state.matches[matchId], 'Match record should exist');
  assert.strictEqual(store.REAL_state.matches[matchId].status, MatchStatus.SCOUTED);

  // 5. Set Interview (Payable)
  const successInterview = dispatch({ type: 'SET_INTERVIEW', payload: { matchId } });
  assert.strictEqual(successInterview, true, 'Setting interview should be successful');
  assert.strictEqual(store.REAL_state.matches[matchId].status, MatchStatus.INTERVIEW_SET);
  
  const interviewBill = store.REAL_state.billing.find(b => b.type === 'fee:interview');
  assert.ok(interviewBill, 'Interview billing record should exist');
  assert.strictEqual(interviewBill.amount, 'jpy:15000', 'Pair interview fee should be jpy:15000');

  // 6. Mark Hired (Payable)
  const successHire = dispatch({ type: 'MARK_HIRED', payload: { matchId } });
  assert.strictEqual(successHire, true, 'Marking hired should be successful');
  assert.strictEqual(store.REAL_state.matches[matchId].status, MatchStatus.HIRED);

  const hireBill = store.REAL_state.billing.find(b => b.type === 'fee:hire');
  assert.ok(hireBill, 'Hire billing record should exist');
  assert.strictEqual(hireBill.amount, 'jpy:350000', 'Pair hire fee should be jpy:350000');

  // 7. Negative Test: Try to pair scout non-friends
  dispatch({ type: 'USER_REGISTER', payload: { id: 'std:3', role: Roles.STUDENT, name: 'Charlie' } });
  const failScout = dispatch({ 
    type: 'SEND_SCOUT', 
    payload: { corpId: 'corp:1', studentIds: ['std:1', 'std:3'] } 
  });
  assert.strictEqual(failScout, false, 'Pair scout should fail for non-mutual friends');

  console.log('--- E2E Test Passed Successfully! ---');
}

runTest().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
