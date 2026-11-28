// Emit the repository's historical reward SQL in fresh-staging order.
// Review and apply only to an empty, confirmed staging project before Afterlight.
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const wallet = read('docs/vocabulary-rewards/phase-2-wallet-schema.sql');
const seedStart = wallet.indexOf('insert into public.vocabulary_reward_catalog');
const seedEnd = wallet.indexOf('-- Purchases are deliberately unavailable',seedStart);
if (seedStart < 0 || seedEnd <= seedStart) throw new Error('Review the changed historical reward seed before staging');

process.stdout.write([
  '-- Fresh staging prerequisite. Review the target before executing.',
  wallet.slice(0,seedStart)+wallet.slice(seedEnd),
  read('docs/vocabulary-rewards/phase-3-sandbox.sql'),
  read('supabase/sql/premium-collections-five-slot-foundation.sql'),
  wallet.slice(seedStart,seedEnd)
].join('\n'));
