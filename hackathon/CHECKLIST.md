# IronShield — Hackathon checklist

## Done (automated)

- [x] Skill: `skill/SKILL.md`
- [x] Risk engine: `reference/risk-engine.mjs`
- [x] Demo video: `demo/ironshield-demo.mp4` (~2 min)
- [x] GitHub repo: https://github.com/jowy81/ironshield
- [x] GitHub Pages: https://jowy81.github.io/ironshield/
- [x] Demo URL (submission): https://jowy81.github.io/ironshield/demo/ironshield-demo.mp4
- [x] Release v1.0.0 with MP4 attached

## You must do (requires your NOVA account)

1. Create account at https://nova-sdk.com if you don't have one
2. Copy `hackathon/.env.example` → `hackathon/.env` and fill credentials
3. Send registration block from `hackathon/SUBMISSION.md` to **@NEARLegionBarcelona** Telegram
4. Wait for staff to add your NOVA account to group `ironclaw-hackathon-260618`
5. Run from repo root:

   ```powershell
   node scripts/nova-submit.mjs
   ```

   Or on IronClaw agent: *"Submit my final entry."*

6. Rotate NOVA API key after submit

## Quick verify

```powershell
node reference/risk-engine.mjs --demo
node scripts/run-hackathon-pipeline.mjs
```
