# Hackathon registration — send to @NEARLegionBarcelona Telegram

Copy the block below and paste it in the event Telegram group so staff can add your NOVA account to the submission group.

```
=== IRONCLAW HACKATHON REGISTRATION ===
participant_name: Joel D. (@jowy81)
agent_id: jowy81-ironshield
nova_account_id: REPLACE_WITH_YOUR_NOVA_ACCOUNT
```

After staff confirms access, set environment variables and run:

```powershell
$env:NOVA_ACCOUNT_ID = "you.nova-sdk.near"
$env:NOVA_API_KEY = "your-api-key"
$env:DEMO_URL = "https://jowy81.github.io/ironshield/demo/ironshield-demo.mp4"
node scripts/nova-submit.mjs
```

Or tell your IronClaw agent:

> Register me for the hackathon. My agent ID is `jowy81-ironshield`, my name is `Joel D. (@jowy81)`, and my NOVA account is `you.nova-sdk.near`.

Then after building:

> Submit my final entry.
