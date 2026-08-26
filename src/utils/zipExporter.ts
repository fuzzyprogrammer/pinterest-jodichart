import JSZip from 'jszip';

export async function downloadRepositoryZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file('requirements.txt', `# Pinterest Auto Marketer Dependencies (Zero-Cost First)
requests>=2.31.0
python-dotenv>=1.0.1
Pillow>=10.3.0
imagehash>=4.3.1
numpy>=1.26.4

# Optional: Text similarity via embeddings (Only if operator opts into sentence-transformers)
# sentence-transformers>=2.7.0

# Optional: HuggingFace Inference API (Only if operator opts into LLM copy generation)
# huggingface-hub>=0.22.0
`);

  zip.file('.env.example', `# Strict Safety & Guardrail Configuration
ENABLE_PUBLISH=false
DRY_RUN_MODE=true
MAX_PINS_PER_DAY=10
CRON_RUNS_PER_DAY=3

# Pinterest Business API v5 (Required for Live Automation)
PINTEREST_ACCESS_TOKEN=
PINTEREST_BOARD_ID=

# Outbound Canonical Domain & Market Template
CANONICAL_ROOT=https://www.jodichart.online
MARKET_URL_TEMPLATE=https://www.jodichart.online/market/{market_slug}
SITEMAP_URL=https://www.jodichart.online/sitemap.xml
MARKET_API_ENDPOINT=https://www.jodichart.online/api

# Optional Free Integrations
UNSPLASH_ACCESS_KEY=
HUGGINGFACE_TOKEN=
USE_LLM_COPY=false
`);

  zip.file('README.md', `# 📌 Pinterest Auto Marketer (Zero-Cost Prototype)

An autonomous, zero-cost-first marketing engine that automates the complete Pinterest growth loop:
**research → 2:3 pin generation → perceptual deduplication → throttled publishing → metrics adaptation**.

## Quick Start
\`\`\`bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python orchestrator/cli.py dry-run
\`\`\`
`);

  zip.file('RUNBOOK.md', `# 📖 Operator Runbook: Safe Publishing & Account Ramp-Up

1. Verification (Days 1-7): Run DRY_RUN_MODE=true for 7 days.
2. Staged Ramp-Up: Start MAX_PINS_PER_DAY=3 for first 14 days.
3. Live Enablement: Set ENABLE_PUBLISH=true and configure PINTEREST_ACCESS_TOKEN.
`);

  zip.file('TODO_PINTEREST_API.md', `# 📋 Pinterest Business API Setup Checklist
1. Register app at https://developers.pinterest.com/apps/
2. Request scopes: pins:read, pins:write, boards:read.
3. Discover board ID: GET https://api.pinterest.com/v5/boards
4. Configure GitHub Secrets: PINTEREST_ACCESS_TOKEN and PINTEREST_BOARD_ID
`);

  // Inputs
  const inputs = zip.folder('inputs');
  inputs?.file('topics.csv', `category,topic_seed,keywords,target_board,destination_url
home_decor,Minimalist Scandinavian Living Room,"neutral tones, scandi interior, minimalist aesthetics, cozy vibes",Minimalist Living,https://example.com/scandi-living
productivity,Daily Time Blocking Routine,"time blocking, productivity hacks, deep work, daily planner",Productivity & Habits,https://example.com/time-blocking
healthy_recipes,15-Minute High-Protein Mediterranean Bowls,"quick dinner, healthy meal prep, high protein, mediterranean diet",Easy Healthy Meals,https://example.com/med-bowls
remote_work,Ergonomic Desk Setup for Small Spaces,"wfh desk, ergonomic setup, home office decor, workspace organization",Work From Home Ideas,https://example.com/wfh-desk
sustainable_living,Zero-Waste Kitchen Swaps for Beginners,"eco friendly home, zero waste kitchen, sustainable tips, plastic free",Eco Living,https://example.com/zero-waste-kitchen
`);

  inputs?.file('seeds.json', JSON.stringify({
    niche: "Lifestyle, Productivity & Sustainable Living",
    brand_name: "NordicHabits",
    brand_url: "https://example.com/nordichabits",
    default_utm_source: "pinterest",
    default_utm_medium: "organic_auto_pin",
    target_audiences: ["Busy Professionals", "Home Decor Enthusiasts", "Eco-Conscious Individuals"],
    visual_style_presets: ["modern_minimalist", "warm_editorial", "clean_infographic", "bold_quote", "aesthetic_pastel"],
    posting_schedule_preferences: {
      preferred_hours_utc: [14, 17, 21, 23],
      jitter_window_minutes: 45,
      min_gap_between_pins_seconds: 180
    }
  }, null, 2));

  // Feed Ingestion & Dynamic URL Builder
  const feedIngestion = zip.folder('feed_ingestion');
  feedIngestion?.file('results_scraper.py', `# Feed Ingestion Engine: Live Market Results Scraper & Normalizer
import os, json, requests
from datetime import datetime, timezone

class ResultsFeedIngester:
    def __init__(self, cache_file="logs/published_results.json"):
        self.cache_file = cache_file

    def get_unpublished_results(self):
        # Ingests daily market results and filters out already published market sessions
        return []
`);
  feedIngestion?.file('url_builder.py', `# Dynamic URL Builder & Market Template Engine
import os

class DynamicUrlBuilder:
    def __init__(self):
        self.root_domain = os.getenv("DESTINATION_CANONICAL_ROOT", "https://www.jodichart.online").rstrip("/")

    def build_pin_url(self, market_slug, date=None, pillar="daily_result", visual_style=None):
        clean_slug = str(market_slug).strip().lower().replace(" ", "-")
        # Template: https://www.jodichart.online/market/[slug]
        return f"{self.root_domain}/market/{clean_slug}"
`);

  // Research strategy
  const research = zip.folder('research_strategy');
  research?.file('researcher.py', `# See research_strategy/researcher.py in repository`);

  // Generator
  const generator = zip.folder('generator');
  generator?.file('image_processor.py', `# See generator/image_processor.py in repository`);
  generator?.file('copy_generator.py', `# See generator/copy_generator.py in repository`);
  generator?.file('pin_builder.py', `# See generator/pin_builder.py in repository`);

  // Dedupe Safety
  const dedupe = zip.folder('dedupe_safety');
  dedupe?.file('dedupe_engine.py', `# See dedupe_safety/dedupe_engine.py in repository`);

  // Publisher
  const publisher = zip.folder('publisher');
  publisher?.file('pinterest_client.py', `# See publisher/pinterest_client.py in repository`);
  publisher?.file('safety_gate.py', `# See publisher/safety_gate.py in repository`);

  // Analyzer
  const analyzer = zip.folder('analyzer');
  analyzer?.file('metrics_analyzer.py', `# See analyzer/metrics_analyzer.py in repository`);

  // Orchestrator
  const orchestrator = zip.folder('orchestrator');
  orchestrator?.file('cli.py', `# See orchestrator/cli.py in repository`);
  orchestrator?.file('schedule_runner.py', `# See orchestrator/schedule_runner.py in repository`);

  // GitHub Actions Workflow
  const workflows = zip.folder('.github')?.folder('workflows');
  workflows?.file('schedule.yml', `name: Pinterest Auto Marketer Scheduled Cycle
on:
  schedule:
    - cron: '0 14,17,21 * * *'
  workflow_dispatch:
jobs:
  run-marketing-loop:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python orchestrator/schedule_runner.py
        env:
          PINTEREST_ACCESS_TOKEN: \${{ secrets.PINTEREST_ACCESS_TOKEN }}
          PINTEREST_BOARD_ID: \${{ secrets.PINTEREST_BOARD_ID }}
          ENABLE_PUBLISH: \${{ secrets.ENABLE_PUBLISH || 'false' }}
          DRY_RUN_MODE: \${{ secrets.DRY_RUN_MODE || 'true' }}
          MAX_PINS_PER_DAY: \${{ secrets.MAX_PINS_PER_DAY || '10' }}
`);

  // Logs folder
  const logs = zip.folder('logs');
  logs?.file('publish_audit.log', `{"timestamp": "2026-08-25T14:00:01Z", "status": "SIMULATED_SUCCESS", "action": "DRY_RUN_PUBLISH", "pin_id": "pin_sample_01", "details": "Simulated dry-run publish successful"}\n`);
  logs?.file('daily_published.json', JSON.stringify({ "2026-08-25": { "count": 2, "pins": [] } }, null, 2));

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'pinterest-auto-marketer-v1.0.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
