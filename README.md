# IronShield

**Zero-trust security layer for IronClaw agents.**

IronShield intercepts every tool call before execution, scores risk, blocks secret exfiltration and destructive actions, maintains a verifiable audit trail, and routes high-risk operations through human approval.

Built for the [NEAR Legion IronClaw Hackathon](https://github.com/jcarbonnell/ironclaw-hackathon) — Barcelona, 18 June 2026.

## Problem

Autonomous agents can:

- Leak API keys and secrets in outbound HTTP requests
- Execute destructive shell commands
- Be steered by prompt injection to exfiltrate data
- Act without an auditable record of what they attempted

## Solution

An IronClaw **skill** that wraps all tool calls with a policy engine:

| Capability | Description |
|---|---|
| **Risk scoring** | 0–100 score from composable rules (secrets, exfil domains, destructive shell, injection) |
| **Block / allow / approve** | CRITICAL → block, MEDIUM/HIGH → human approval, LOW → auto-allow |
| **Audit trail** | JSONL log with redacted payloads — verifiable evidence for operators and judges |
| **Allowlist** | Trusted domains (GitHub, NEAR, Nova) vs unknown exfil targets |

## Quick demo (no IronClaw required)

```bash
node reference/risk-engine.mjs --demo
```

Example output:

```
🚫 Secret exfiltration via HTTP
   Decision: BLOCK | Score: 75/100 (HIGH)
   Signals: SECRET_IN_URL, EXFIL_DOMAIN

✅ Legitimate GitHub API call
   Decision: ALLOW | Score: 0/100 (LOW)
```

## Install on IronClaw

1. Copy the skill to your agent:

   ```bash
   mkdir -p /home/agent/.ironclaw/skills/ironshield
   cp skill/SKILL.md /home/agent/.ironclaw/skills/ironshield/SKILL.md
   ```

2. Restart the agent.

3. IronShield activates automatically before every tool call. No configuration required.

## Hackathon submission

| Field | Value |
|---|---|
| **Title** | IronShield |
| **Workflow** | Zero-trust skill intercepts agent tool calls, scores risk, blocks exfiltration, and logs auditable evidence with human approval for elevated actions. |
| **Skills built** | `ironshield` |
| **Repo** | https://github.com/jowy81/ironshield |

## Architecture

```
User request
     │
     ▼
IronClaw Agent (LLM)
     │
     ▼
┌─────────────┐
│  IronShield  │  assess_tool_call → score → ALLOW | BLOCK | APPROVE
└─────────────┘
     │
     ▼
  Tool execution (shell, http, memory, …)
     │
     ▼
  record_tool_execution → ironshield/audit/*.jsonl
```

## License

MIT
