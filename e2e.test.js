// @yume-format: 1
/**
 * e2e.test.js - Comprehensive 100% Code Coverage E2E Testing Suite
 * @tags: test, e2e, native-runner, coverage
 */

import test from 'node:test';
import assert from 'node:assert';
import { store, dispatch } from './logic.yume.js';
import { Roles, MatchStatus } from './BIBLE.js';

test('E2E Full Flow: Register, Pair Scout, Funnel Progress, Billing, Exceptions', () => {
  // Reset store to initial fresh state
  store.REAL_state = {
    users: {},
    matches: {},
    billing: [],
    REAL_auth: null
  };

  // 1. USER_REGISTER (Success & Exception guards)
  const regStd1 = dispatch({ type: 'USER_REGISTER', payload: { id: 'std:1', role: Roles.STUDENT, name: 'Alice (清水)', sport: 'サッカー' } });
  const regStd2 = dispatch({ type: 'USER_REGISTER', payload: { id: 'std:2', role: Roles.STUDENT, name: 'Bob (木村)', sport: 'サッカー' } });
  const regStd3 = dispatch({ type: 'USER_REGISTER', payload: { id: 'std:3', role: Roles.STUDENT, name: 'Charlie', sport: 'テニス' } });
  const regCorp1 = dispatch({ type: 'USER_REGISTER', payload: { id: 'corp:1', role: Roles.CORPORATION, name: 'Mega Corp' } });

  assert.strictEqual(regStd1, true, 'Alice should register');
  assert.strictEqual(regStd2, true, 'Bob should register');
  assert.strictEqual(regStd3, true, 'Charlie should register');
  assert.strictEqual(regCorp1, true, 'Mega Corp should register');

  // Register fail exception (field missing)
  const regFail1 = dispatch({ type: 'USER_REGISTER', payload: { id: 'std:fail', role: Roles.STUDENT } }); // No name
  assert.strictEqual(regFail1, false, 'Should fail to register without a name');

  // 2. SET_AUTH (Auth session management)
  const setAuthPass = dispatch({ type: 'SET_AUTH', payload: { publicId: 'corp:1', identity: { name: 'Mega Corp' } } });
  assert.strictEqual(setAuthPass, true, 'Should allow writing valid auth session');
  assert.strictEqual(store.REAL_state.REAL_auth.publicId, 'corp:1');

  // Auth session invalid (missing credentials)
  const setAuthFail = dispatch({ type: 'SET_AUTH', payload: null });
  assert.strictEqual(setAuthFail, false, 'Should decline null auth setting');

  // 3. SEND_SCOUT (Single Scout, Rejection, and Transition Guards)
  // Normal Single Scout: Mega Corp -> Charlie
  const singleScoutPass = dispatch({ type: 'SEND_SCOUT', payload: { corpId: 'corp:1', studentIds: ['std:3'] } });
  assert.strictEqual(singleScoutPass, true, 'Should successfully send single scout');
  
  const matchCharlieId = 'match:corp:1:std:3';
  assert.strictEqual(store.REAL_state.matches[matchCharlieId].status, MatchStatus.SCOUTED);

  // Scout Rejection (辞退・お見送り)
  const rejectPass = dispatch({ type: 'REJECT_SCOUT', payload: { matchId: matchCharlieId } });
  assert.strictEqual(rejectPass, true, 'Charlie should reject the scout');
  assert.strictEqual(store.REAL_state.matches[matchCharlieId].status, MatchStatus.REJECTED);

  // Illegal Transition Guard: Try to set interview on REJECTED match
  const illegalTransition = dispatch({ type: 'SET_INTERVIEW', payload: { matchId: matchCharlieId } });
  assert.strictEqual(illegalTransition, false, 'Should reject transitioning from REJECTED to INTERVIEW_SET');

  // Invalid match operation
  const invalidMatchOp = dispatch({ type: 'SET_INTERVIEW', payload: { matchId: 'non-existent-match' } });
  assert.strictEqual(invalidMatchOp, false, 'Should reject operations on non-existent matches');

  // 4. PAIR SCOUT (Eligibility and Friend Correlation Guards)
  // Fail Pair Scout: Alice and Charlie (not mutual friends)
  const failPairScout = dispatch({ type: 'SEND_SCOUT', payload: { corpId: 'corp:1', studentIds: ['std:1', 'std:3'] } });
  assert.strictEqual(failPairScout, false, 'Should deny pairing when mutual link is absent');

  // Activate Mutual Best Friend link via standard SET_FRIEND dispatch
  const setFriend1 = dispatch({ type: 'SET_FRIEND', payload: { studentId: 'std:1', friendId: 'std:2' } }); // Aliceお気に入りBob
  const setFriend2 = dispatch({ type: 'SET_FRIEND', payload: { studentId: 'std:2', friendId: 'std:1' } }); // Bobお気に入りAlice
  assert.strictEqual(setFriend1, true, 'Alice should link Bob');
  assert.strictEqual(setFriend2, true, 'Bob should link Alice');

  // Success Pair Scout: Alice and Bob (mutual link activated)
  const successPairScout = dispatch({ type: 'SEND_SCOUT', payload: { corpId: 'corp:1', studentIds: ['std:1', 'std:2'] } });
  assert.strictEqual(successPairScout, true, 'Should allow pair scout when mutual best friend link exists');

  const matchPairId = 'match:corp:1:std:1-std:2';
  assert.strictEqual(store.REAL_state.matches[matchPairId].status, MatchStatus.SCOUTED);

  // 5. PAIR FUNNEL (Set Interview, Mark Hired & Billing Validation)
  // Pair Interview Set (jpy:15000)
  const setInterviewPass = dispatch({ type: 'SET_INTERVIEW', payload: { matchId: matchPairId } });
  assert.strictEqual(setInterviewPass, true, 'Should successfully transition pair to interview');
  assert.strictEqual(store.REAL_state.matches[matchPairId].status, MatchStatus.INTERVIEW_SET);

  const interviewBill = store.REAL_state.billing.find(b => b.type === '手数料:面談');
  assert.ok(interviewBill, 'Interview billing record should exist');
  assert.strictEqual(interviewBill.amount, 'jpy:15000', 'Pair interview fee should be domain-tagged jpy:15000');

  // 5. CHAT MESSAGING DURING INTERVIEW
  // Attempt sending message BEFORE paying the bill (must be blocked)
  const prePayMsg = dispatch({ type: 'SEND_MESSAGE', payload: { matchId: matchPairId, senderId: 'std:1', text: 'お支払い前のテスト' } });
  assert.strictEqual(prePayMsg, false, 'Should decline messages sent before bill is paid');

  // Pay the bill
  const payRes = dispatch({ type: 'PAY_BILL', payload: { billId: interviewBill.id } });
  assert.strictEqual(payRes, true, 'PAY_BILL should succeed');
  assert.strictEqual(store.REAL_state.billing[0].status, 'PAID', 'Bill status should be PAID');

  // SEND_MESSAGE after paying the bill (must succeed)
  const msgRes = dispatch({ type: 'SEND_MESSAGE', payload: { matchId: matchPairId, senderId: 'std:1', text: '初めまして！よろしくお願いします！' } });
  assert.strictEqual(msgRes, true, 'Student should be allowed to send message after payment is completed');
  assert.strictEqual(store.REAL_state.messages.length, 1, 'Message list should contain 1 message');
  assert.strictEqual(store.REAL_state.messages[0].text, '初めまして！よろしくお願いします！');

  // Attempt chat messaging from a non-participating student
  const badMsgRes = dispatch({ type: 'SEND_MESSAGE', payload: { matchId: matchPairId, senderId: 'std:charlie', text: '割り込みチャット' } });
  assert.strictEqual(badMsgRes, false, 'Non-participating student must be rejected from sending messages');

  // Pair Hire Hired (jpy:350000)
  const setHirePass = dispatch({ type: 'MARK_HIRED', payload: { matchId: matchPairId } });
  assert.strictEqual(setHirePass, true, 'Should successfully transition pair to hired');
  assert.strictEqual(store.REAL_state.matches[matchPairId].status, MatchStatus.HIRED);

  const hireBill = store.REAL_state.billing.find(b => b.type === '手数料:採用');
  assert.ok(hireBill, 'Hire billing record should exist');
  assert.strictEqual(hireBill.amount, 'jpy:350000', 'Pair hire fee should be domain-tagged jpy:350000');

  // 6. INVALID SCOUT CRITERIA (Non-existent senders/receivers)
  // Send scout from non-existent corporation
  const badCorpScout = dispatch({ type: 'SEND_SCOUT', payload: { corpId: 'corp:ghost', studentIds: ['std:1'] } });
  assert.strictEqual(badCorpScout, false, 'Should decline scouts from non-registered corporations');

  // Send scout to non-existent student
  const badStudentScout = dispatch({ type: 'SEND_SCOUT', payload: { corpId: 'corp:1', studentIds: ['std:ghost'] } });
  assert.strictEqual(badStudentScout, false, 'Should decline scouts sent to non-registered students');

  // Send scout from a student role (role constraint failure)
  const studentTriesToScout = dispatch({ type: 'SEND_SCOUT', payload: { corpId: 'std:1', studentIds: ['std:2'] } });
  assert.strictEqual(studentTriesToScout, false, 'Students should not be allowed to act as scouts');
});
