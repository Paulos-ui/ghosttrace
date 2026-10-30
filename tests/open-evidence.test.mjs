import test from 'node:test';
import assert from 'node:assert/strict';
import { sourcePassages, scorePassages } from '../src/lib/evidence-passages.js';

test('source passages preserve actual text and accept multiple paragraphs',()=>{
  const report='The substation failed at midnight and electrical power was lost across the north district.\n\nThe pumps stopped and drinking water pressure decreased within 15 minutes.';
  const p=sourcePassages(report);
  assert.equal(p.length,2);
  assert.ok(p.every(x=>report.includes(x)));
});
test('normalized embeddings rank relevant passages and exclude others',()=>{
  const passages=['water pump failed','traffic unaffected'];
  const got=scorePassages([[1,0],[.9,.1],[0,1]],passages,2);
  assert.equal(got[0].text,'water pump failed');
  assert.ok(got[0].similarity>got[1].similarity);
});
test('invalid embedding shapes fail',()=>{
  assert.throws(()=>scorePassages([[1,0]],['x']));
});
