import assert from 'node:assert/strict';
import test from 'node:test';
import { traceCascade, positionNodes } from '../src/lib/engine.js';
const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
const links = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'a' }];
test('traces directed propagation without looping on cycles', () => {
 const result = traceCascade(nodes, links, 'a');
 assert.deepEqual(result.affected, ['a','b','c']);
 assert.deepEqual(result.waves, [['a'], ['b'], ['c']]);
 assert.deepEqual(result.paths.c, ['a','b','c']);
});
test('cutting one node stops downstream propagation', () => {
 const result = traceCascade(nodes, links, 'a', ['b']);
 assert.deepEqual(result.affected, ['a']);
});
test('invalid source creates an empty trace', () => {
 assert.equal(traceCascade(nodes, links, 'unknown').affected.length,0);
});
test('positions are deterministic and finite', () => {
 const first = positionNodes(nodes), second = positionNodes(nodes);
 assert.deepEqual(first, second);
 assert.ok(first.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));
});
