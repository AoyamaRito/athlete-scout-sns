// @yume-format: 1
/**
 * unit.test.js - Pure Function Unit Testing for Athlete Scout Core
 * @tags: test, unit, native-runner
 */

import test from 'node:test';
import assert from 'node:assert';
import { hash, evalConstraint } from './yume-core.js';
import { checkPairEligibility } from './BIBLE.js';
import { createNewUserIdentity, authenticateWithKey } from './auth.yume.js';

test('yume-core: hash stability and uniqueness', () => {
  const objA = { id: 'std:1', name: 'Alice', friends: ['std:2'] };
  const objB = { name: 'Alice', id: 'std:1', friends: ['std:2'] }; // Keys reordered
  const objC = { id: 'std:1', name: 'Bob', friends: ['std:2'] };

  assert.strictEqual(hash(objA), hash(objB), 'Hash should be key-order independent');
  assert.notStrictEqual(hash(objA), hash(objC), 'Different content must produce different hashes');
});

test('yume-core: evalConstraint rule checker', () => {
  const mockStatusTransitions = {
    axes: ['from', 'to'],
    values: {
      from: ['状態:未接触', '状態:スカウト済み'],
      to:   ['状態:未接触', '状態:スカウト済み']
    },
    derive: combo => {
      const valid = (combo.from === '状態:未接触' && combo.to === '状態:スカウト済み');
      return { _isValid: valid };
    }
  };

  const passResult = evalConstraint(mockStatusTransitions, { from: '状態:未接触', to: '状態:スカウト済み' });
  const failResult = evalConstraint(mockStatusTransitions, { from: '状態:スカウト済み', to: '状態:未接触' });

  assert.strictEqual(passResult.worlds[0]._isValid, true, 'Transition from idle to scouted should be valid');
  assert.strictEqual(failResult.worlds[0]._isValid, false, 'Transition backward should be invalid');
});

test('BIBLE: checkPairEligibility best-friend criteria', () => {
  const userA = { id: 'std:1', profile: { friends: ['std:2'] } };
  const userB = { id: 'std:2', profile: { friends: ['std:1'] } };
  const userC = { id: 'std:3', profile: { friends: [] } };

  assert.strictEqual(checkPairEligibility(userA, userB), true, 'Mutual friends should be eligible for pairing');
  assert.strictEqual(checkPairEligibility(userA, userC), false, 'One-sided friendship must not be eligible');
});

test('auth: Ed25519 identity generation & recovery', async () => {
  const identity = await createNewUserIdentity();
  assert.ok(identity.recoveryKey, 'Identity must generate a recovery key');
  assert.ok(identity.publicId, 'Identity must generate a publicId');

  const recovered = await authenticateWithKey(identity.recoveryKey);
  assert.strictEqual(recovered.success, true, 'Recovery must succeed with valid key');
  assert.strictEqual(recovered.publicId, identity.publicId, 'Recovered public ID must match');

  const invalidRecover = await authenticateWithKey('invalid-recovery-key-format');
  assert.strictEqual(invalidRecover.success, false, 'Invalid recovery key must fail gracefully');
});
