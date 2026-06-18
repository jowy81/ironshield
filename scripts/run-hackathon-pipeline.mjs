#!/usr/bin/env node
/** Run full hackathon prep pipeline from repo root. */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
}

console.log('IronShield — hackathon pipeline\n');

run('node reference/risk-engine.mjs --demo');

if (!existsSync('docs/demo/ironshield-demo.mp4')) {
  run('node scripts/generate-demo-video.mjs');
  run('mkdir docs\\demo 2>nul & copy /Y demo\\ironshield-demo.mp4 docs\\demo\\ironshield-demo.mp4');
}

if (process.env.NOVA_ACCOUNT_ID && process.env.NOVA_API_KEY) {
  run('node scripts/nova-submit.mjs');
} else {
  console.log('\n⚠ NOVA_ACCOUNT_ID / NOVA_API_KEY not set — skip encrypted submit.');
  console.log('  See hackathon/SUBMISSION.md for registration + submit steps.');
}

console.log('\n✅ Pipeline done.');
console.log('Demo URL: https://jowy81.github.io/ironshield/demo/ironshield-demo.mp4');
