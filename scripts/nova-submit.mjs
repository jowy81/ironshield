#!/usr/bin/env node
/**
 * Standalone NOVA hackathon submission (mirrors nova-submit WASM tool).
 * Usage:
 *   NOVA_ACCOUNT_ID=you.nova-sdk.near NOVA_API_KEY=xxx node scripts/nova-submit.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const NOVA_AUTH_URL = 'https://nova-sdk.com/api/auth/session-token';
const NOVA_MCP_BASE =
  'https://5a5223f7d1bfe777433c496b9d52ff851e927259-8000.dstack-prod5.phala.network';
const GROUP_ID = 'ironclaw-hackathon-260618';
const AGENT_ID = process.env.HACKATHON_AGENT_ID || 'jowy81-ironshield';
const PARTICIPANT = process.env.HACKATHON_PARTICIPANT || 'Joel D. (@jowy81)';
const DEMO_URL =
  process.env.DEMO_URL || 'https://jowy81.github.io/ironshield/demo/ironshield-demo.mp4';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

async function getSessionToken(accountId, apiKey) {
  const res = await fetch(NOVA_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({ account_id: accountId }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`session-token HTTP ${res.status}: ${text}`);
  const json = JSON.parse(text);
  if (!json.token) throw new Error('No token in session-token response');
  return json.token;
}

function mcpHeaders(token, accountId) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'x-account-id': accountId,
    'x-wallet-id': accountId,
  };
}

async function prepareUpload(token, accountId, groupId, filename) {
  const res = await fetch(`${NOVA_MCP_BASE}/tools/prepare_upload`, {
    method: 'POST',
    headers: mcpHeaders(token, accountId),
    body: JSON.stringify({ group_id: groupId, filename }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`prepare_upload HTTP ${res.status}: ${text}`);
  const json = JSON.parse(text);
  const result = json.result ?? json;
  if (!result.upload_id || !result.key) throw new Error('prepare_upload missing fields');
  return { uploadId: result.upload_id, keyB64: result.key };
}

async function encryptAesGcm(keyB64, plaintext, uploadId) {
  const keyBytes = Buffer.from(keyB64, 'base64');
  if (keyBytes.length !== 32) throw new Error(`Expected 32-byte key, got ${keyBytes.length}`);

  const nonce = createHash('sha256').update(uploadId).digest().subarray(0, 12);
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
  ]);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cryptoKey, plaintext);
  const out = Buffer.concat([nonce, Buffer.from(ciphertext)]);
  return out.toString('base64');
}

async function finalizeUpload(token, accountId, uploadId, encryptedB64, fileHash) {
  const res = await fetch(`${NOVA_MCP_BASE}/tools/finalize_upload`, {
    method: 'POST',
    headers: mcpHeaders(token, accountId),
    body: JSON.stringify({
      upload_id: uploadId,
      encrypted_data: encryptedB64,
      file_hash: fileHash,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`finalize_upload HTTP ${res.status}: ${text}`);
  const json = JSON.parse(text);
  const result = json.result ?? json;
  return {
    cid: result.cid ?? result.ipfs_hash,
    transId: result.trans_id ?? '',
  };
}

function buildSubmissionMarkdown() {
  const now = new Date().toISOString();
  return `# ${PARTICIPANT} — ${AGENT_ID}

submitted_at_utc: ${now}
nova_account: ${process.env.NOVA_ACCOUNT_ID}

## Project
title: IronShield
workflow_description: Zero-trust IronClaw skill intercepts every tool call, scores exfiltration and injection risk, blocks critical actions, requires human approval for elevated ops, and writes redacted JSONL audit trails.

## Demo
demo_url: ${DEMO_URL}

## Links
github_repo: https://github.com/jowy81/ironshield

## Skills and tools
skills_list: ironshield

## Notes
Offline demo: node reference/risk-engine.mjs --demo. Demo video hosted on GitHub Pages. IronShield skill at skill/SKILL.md.
`;
}

async function main() {
  const accountId = process.env.NOVA_ACCOUNT_ID;
  const apiKey = process.env.NOVA_API_KEY;
  if (!accountId || !apiKey) {
    console.error('Missing NOVA_ACCOUNT_ID or NOVA_API_KEY');
    process.exit(1);
  }

  const content = buildSubmissionMarkdown();
  const submissionPath = join(root, 'hackathon-submission.md');
  writeFileSync(submissionPath, content, 'utf8');
  console.log('Submission markdown written:', submissionPath);

  const token = await getSessionToken(accountId, apiKey);
  console.log('Session token obtained');

  const filename = `${AGENT_ID}-submission.md`;
  const { uploadId, keyB64 } = await prepareUpload(token, accountId, GROUP_ID, filename);
  console.log('Upload prepared:', uploadId);

  const plaintext = Buffer.from(content, 'utf8');
  const fileHash = createHash('sha256').update(plaintext).digest('hex');
  const encryptedB64 = await encryptAesGcm(keyB64, plaintext, uploadId);

  const { cid, transId } = await finalizeUpload(token, accountId, uploadId, encryptedB64, fileHash);
  console.log('\n✅ SUBMITTED');
  console.log('CID:', cid);
  console.log('trans_id:', transId);
  writeFileSync(join(root, 'hackathon-submission-result.json'), JSON.stringify({ cid, transId }, null, 2));
}

main().catch((e) => {
  console.error('Submit failed:', e.message);
  process.exit(1);
});
