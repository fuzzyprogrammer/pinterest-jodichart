# 📖 Operator Runbook: Safe Publishing & Account Ramp-Up

This runbook details how to safely transition from dry-run simulations to live Pinterest Business API publishing without triggering platform anti-spam or account-flagging heuristics.

---

## 🚦 Phase 1: Verification & Pre-Flight (Days 1–7)

Before posting any live pins, run the engine in `DRY_RUN_MODE=true` for at least 3 to 7 days. This creates a baseline audit history in `logs/publish_audit.log` and verifies that your topic seeds produce diverse copy and perceptual hashes without duplication errors. Verify that your destination URLs are active, mobile-responsive, and have correct OpenGraph metadata.

During this period, perform standard organic human activity on the Pinterest account (create 3–5 public boards manually, pin high-authority third-party content, set a custom profile photo, and claim your website domain in the Pinterest Business Settings).

---

## 📈 Phase 2: Staged Ramp-Up Schedule

Abrupt spikes in posting volume on new API tokens are a primary trigger for automated shadowbans. Follow this staged ramp-up:

| Timeline | `MAX_PINS_PER_DAY` | `CRON_RUNS_PER_DAY` | Focus |
| :--- | :--- | :--- | :--- |
| **Days 1–14** | `3` | `3` (1 pin / run) | Organic domain warm-up, monitor Save/Click rate |
| **Days 15–30** | `5` | `3` (1–2 pins / run) | Introduce additional board targets and style variants |
| **Days 31–60** | `8` | `4` (2 pins / run) | Review `logs/adjustments.json` and prune poor topics |
| **Day 60+** | `10` (Maximum) | `4` (2–3 pins / run) | Stable autonomous equilibrium |

---

## 🛡️ Anti-Flagging Operational Checklist

1. **Jitter Enforcement**: Ensure `schedule_runner.py` maintains randomized pauses (15–45s between calls) and cron execution jitter (±30–90m offsets). Never publish at exact second-aligned intervals.
2. **Perceptual Deduplication**: Do not bypass `dedupe_engine.py`. If a topic seed is repeated, ensure the template, crop, and headline formula are distinctly altered.
3. **URL & UTM Diversity**: Avoid routing every pin to the exact same homepage. Direct pins to specific articles, category landing pages, or deep guides.
4. **429 Rate-Limit Handling**: If Pinterest returns HTTP 429, the engine automatically applies exponential backoff with randomized jitter. If 429s persist, decrease `MAX_PINS_PER_DAY`.
5. **Human-in-the-Loop Reviews**: Weekly, inspect `logs/publish_audit.log` and the Pinterest Analytics dashboard to identify repins, outbound clicks, and user feedback.
