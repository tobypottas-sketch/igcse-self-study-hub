import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { countMasteredPathways, meritProgress } from '../src/vocabulary/merits.js';

// Model native textContent writes: replacing even identical text produces a childList mutation.
// Drive a bounded number of observer rounds so an accidental microtask loop cannot hang the runner.
test('student display refresh settles instead of starving Unit opening with its own mutations', async () => {
  const source = (await readFile(new URL('../src/vocabulary/student-merit-progress.js', import.meta.url), 'utf8'))
    .replace(/^import .*;\n/gm, '');
  let text = 'Loading progress';
  let writes = 0;
  let pending = false;
  let observer;
  let nodes;
  const node = () => ({
    get textContent() { return text; },
    set textContent(value) { text = value; writes += 1; pending = true; }
  });
  nodes = [node()];
  const client = {
    auth:{ getUser:async () => ({ data:{ user:{ id:'synthetic-student' } } }) },
    rpc:async () => ({ data:2, error:null }),
    from:table => ({ select:() => ({
      eq:() => ({ single:async () => ({ data:{ role:'student' } }), eq:async () => ({ data:[] }) }),
      then:resolve => resolve({ data:[], error:null })
    }) })
  };
  vm.runInNewContext(source, {
    getSupabaseClient:async () => client, countMasteredPathways, meritProgress, console,
    document:{ documentElement:{}, querySelectorAll:() => nodes },
    MutationObserver:class { constructor(callback) { observer = callback; } observe() {} }
  });
  const settle = async () => {
    for (let round = 0; round < 20; round += 1) {
      await new Promise(resolve => setImmediate(resolve));
      if (pending) { pending = false; observer(); }
    }
  };
  await settle();
  assert.equal(text, meritProgress(0,2,0).copy);
  assert.equal(writes, 1, 'unchanged text must not schedule another observer refresh');
  assert.equal(pending, false);

  // A replacement Home node must still receive the cached copy after normal navigation.
  text = 'Loading progress'; nodes = [node()]; observer();
  await settle();
  assert.equal(text, meritProgress(0,2,0).copy);
  assert.equal(writes, 2);
  assert.equal(pending, false);
});
