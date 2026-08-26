# 📌 Pinterest Auto Marketer (Zero-Cost Prototype)

An autonomous, zero-cost-first marketing engine that automates the complete Pinterest growth loop: **trend research → 2:3 visual pin generation → perceptual deduplication & policy checks → throttled scheduled publishing → metrics-driven adaptation → repeat**.

Designed with **strict safety guardrails**, zero proprietary API dependencies by default, and auditable GitHub Actions automation.

---

## 🌟 Key Features

- 💸 **Zero-Cost First Architecture**: Runs entirely within free tiers (GitHub Actions + Unsplash free tier + local Pillow procedural styling). No GPU or paid APIs needed.
- 🛡️ **Fail-Safe Publishing Guard**: Live API posting is strictly gated behind `ENABLE_PUBLISH="true"` AND secret validation. In default `DRY_RUN_MODE="true"`, all operations simulate payloads and persist audit logs safely.
- 🔍 **Perceptual Image & Text Deduplication**: Utilizes `imagehash` (Hamming distance threshold < 5) and Levenshtein token overlap to guarantee no near-duplicate content or cross-board spamming.
- 🎨 **Pinterest 2:3 Pin Studio**: Generates 1000x1500 px high-readability pin graphics with customizable templates (Modern Minimalist, Warm Editorial, Clean Infographic, Bold Quote, Aesthetic Pastel), UTM tracking links, and CTA badges.
- ⏱️ **Anti-Flagging Heuristics**: Jitter randomization (±30–90m schedule offsets, 2–300s sequential API delays), exponential backoff with retry on 429 rate limits, and conservative daily caps.
- 📈 **Continuous Adaptation Engine**: Computes CTR and Save Rate per template style to generate `logs/adjustments.json`, automatically optimizing future pin designs.
- 🗂️ **Complete Audit Trail**: Every publish attempt (simulated or real) is recorded in `logs/publish_audit.log` and `logs/daily_published.json`.

---

## 📁 Repository Structure

```text
pinterest-auto-marketer/
├── .github/
│   └── workflows/
│       └── schedule.yml          # GitHub Actions 3x/day cron automation
├── inputs/
│   ├── topics.csv                # Topic seeds, target boards & destination URLs
│   └── seeds.json                # Brand identity, visual presets & schedule settings
├── research_strategy/
│   └── researcher.py             # Trend heuristics & content planner
├── generator/
│   ├── image_processor.py        # Pillow 1000x1500 pin graphic renderer & pHash
│   ├── copy_generator.py         # SEO title, description & CTA copy engine
│   └── pin_builder.py            # Orchestrator for graphics + copy + UTM tracking
├── dedupe_safety/
│   └── dedupe_engine.py          # Perceptual hash & text similarity policy checker
├── publisher/
│   ├── pinterest_client.py       # Pinterest v5 API client with 429 backoff
│   └── safety_gate.py            # Strict gating, daily cap limiter & audit logger
├── analyzer/
│   └── metrics_analyzer.py       # Ingests metrics & outputs adjustments.json
├── orchestrator/
│   ├── cli.py                    # Unified CLI (generate, dry-run, publish, test)
│   └── schedule_runner.py        # Cron runner with per-run quota calculation
├── logs/                         # Persisted audit logs & daily counters
├── examples/                     # Sample pin JSON and adaptation artifacts
├── requirements.txt              # Zero-cost Python dependencies
├── RUNBOOK.md                    # Safe enablement and ramp-up runbook
└── TODO_PINTEREST_API.md         # Pinterest Business API setup checklist
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/pinterest-auto-marketer.git
cd pinterest-auto-marketer

# Create Python virtual environment (Python 3.10+)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install zero-cost dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration (Safe Simulation):
```ini
# --- STRICT SAFETY GATES ---
ENABLE_PUBLISH=false
DRY_RUN_MODE=true
MAX_PINS_PER_DAY=10
CRON_RUNS_PER_DAY=3

# --- PINTEREST BUSINESS API (Leave empty for Dry-Run) ---
PINTEREST_ACCESS_TOKEN=
PINTEREST_BOARD_ID=

# --- OPTIONAL FREE ASSETS ---
UNSPLASH_ACCESS_KEY=
HUGGINGFACE_TOKEN=
USE_LLM_COPY=false
```

---

## 💻 CLI Usage

### Run System Health & Quota Check
```bash
python orchestrator/cli.py status
```

### Generate Pin Candidates (No Publishing)
```bash
# Generate 3 pins from inputs/topics.csv
python orchestrator/cli.py generate --count 3

# Generate a pin for a custom topic
python orchestrator/cli.py generate --topic "Cozy Home Office Lighting" --category "home_decor"
```

### Simulate Full Automation Cycle (Dry-Run)
```bash
python orchestrator/cli.py dry-run --count 2
```

### Run Performance Adaptation & Feedback
```bash
python orchestrator/cli.py analyze
```

### Run Zero-Cost Acceptance Test Suite
```bash
python orchestrator/cli.py test
```

---

## 🔒 Enabling Real Publishing Safely

Please read **[RUNBOOK.md](RUNBOOK.md)** and **[TODO_PINTEREST_API.md](TODO_PINTEREST_API.md)** before enabling live API calls.

1. Create a Pinterest Business App and obtain a User Access Token with `pins:read, pins:write, boards:read`.
2. Retrieve your target Board ID.
3. In GitHub Repository Settings → **Secrets and variables** → **Actions**, add:
   - `PINTEREST_ACCESS_TOKEN`
   - `PINTEREST_BOARD_ID`
   - `ENABLE_PUBLISH="true"`
   - `DRY_RUN_MODE="false"`
4. Start with a conservative `MAX_PINS_PER_DAY=3` for the first 14 days to establish healthy account age heuristics.
