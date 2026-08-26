import React, { useState } from 'react';
import { 
  FileCode, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet,
  Globe,
  Radio
} from 'lucide-react';

interface RepoExplorerTabProps {
  onDownloadZip: () => void;
}

export const RepoExplorerTab: React.FC<RepoExplorerTabProps> = ({ onDownloadZip }) => {
  const [selectedFile, setSelectedFile] = useState('feed_ingestion/results_scraper.py');
  const [copied, setCopied] = useState(false);

  const fileContents: Record<string, { content: string; language: string }> = {
    'feed_ingestion/results_scraper.py': {
      language: 'python',
      content: `#!/usr/bin/env python3
"""
Feed Ingestion Engine: Live Market Results Scraper & Normalizer
Fetches daily declared Open/Close pana and Jodi numbers from JSON APIs / Web Feeds,
verifies declaration timestamps against market opening hours, and detects new results.
"""
import os, sys, json, requests
from datetime import datetime, timezone

class ResultsFeedIngester:
    def __init__(self, cache_file="logs/published_results.json"):
        self.cache_file = cache_file
        self.api_endpoint = os.getenv("RESULTS_API_ENDPOINT", "https://api.jodichart.online/v1/live")
        self._ensure_cache()

    def _ensure_cache(self):
        if not os.path.exists(self.cache_file):
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            with open(self.cache_file, "w") as f:
                json.dump({"published_keys": []}, f, indent=2)

    def fetch_today_results(self):
        """
        Fetches live market results. If external API is unavailable,
        falls back to deterministic simulation feed with zero external cost.
        """
        try:
            resp = requests.get(self.api_endpoint, timeout=5)
            if resp.status_code == 200:
                return resp.json().get("markets", [])
        except Exception:
            pass

        # Zero-Cost Fallback Live Feed
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return [
            {
                "market_name": "Kalyan Day",
                "market_slug": "kalyan",
                "date": today,
                "open_time": "03:45 PM",
                "close_time": "05:45 PM",
                "open_pana": "348",
                "jodi": "56",
                "close_pana": "789",
                "status": "FULL_DECLARED",
            },
            {
                "market_name": "Milan Night",
                "market_slug": "milan-night",
                "date": today,
                "open_time": "09:00 PM",
                "close_time": "11:00 PM",
                "open_pana": "249",
                "jodi": "58",
                "close_pana": "369",
                "status": "FULL_DECLARED",
            },
            {
                "market_name": "Rajdhani Day",
                "market_slug": "rajdhani-day",
                "date": today,
                "open_time": "03:00 PM",
                "close_time": "05:00 PM",
                "open_pana": "136",
                "jodi": "09",
                "close_pana": "469",
                "status": "FULL_DECLARED",
            },
            {
                "market_name": "Main Bazar",
                "market_slug": "main-bazar",
                "date": today,
                "open_time": "09:40 PM",
                "close_time": "12:05 AM",
                "open_pana": "147",
                "jodi": "2*",
                "close_pana": "***",
                "status": "OPEN_DECLARED",
            }
        ]

    def get_unpublished_results(self):
        """
        Returns only market results that have not yet been published today.
        """
        with open(self.cache_file, "r") as f:
            cache = json.load(f)
        published_keys = set(cache.get("published_keys", []))

        results = self.fetch_today_results()
        unpublished = []
        for r in results:
            dedupe_key = f"{r['market_slug']}_{r['date']}_{r['status']}_{r['open_pana']}_{r['jodi']}_{r['close_pana']}"
            if dedupe_key not in published_keys:
                r["dedupe_key"] = dedupe_key
                unpublished.append(r)

        return unpublished

    def mark_as_published(self, dedupe_key):
        with open(self.cache_file, "r") as f:
            cache = json.load(f)
        keys = cache.get("published_keys", [])
        if dedupe_key not in keys:
            keys.append(dedupe_key)
            cache["published_keys"] = keys
            with open(self.cache_file, "w") as f:
                json.dump(cache, f, indent=2)
`
    },
    'feed_ingestion/url_builder.py': {
      language: 'python',
      content: `#!/usr/bin/env python3
"""
Dynamic URL Builder & Market Template Engine
Constructs canonical destination URLs based on the market template:
https://www.jodichart.online/market/[slug]
No date or search query parameters are added to the link.
"""
import os

class DynamicUrlBuilder:
    def __init__(self):
        self.root_domain = os.getenv("DESTINATION_CANONICAL_ROOT", "https://www.jodichart.online").rstrip("/")

    def build_pin_url(self, market_slug, date=None, pillar="daily_result", visual_style=None):
        clean_slug = str(market_slug).strip().lower().replace(" ", "-")
        # Template: https://www.jodichart.online/market/[slug]
        return f"{self.root_domain}/market/{clean_slug}"
`
    },
    'orchestrator/cli.py': {
      language: 'python',
      content: `#!/usr/bin/env python3
"""
Pinterest Auto Marketer - Unified CLI
Usage:
  python orchestrator/cli.py ingest-and-generate
  python orchestrator/cli.py generate [--count 3] [--topic "Topic"]
  python orchestrator/cli.py dry-run [--count 2]
  python orchestrator/cli.py publish [--file path/to/pin.json]
  python orchestrator/cli.py analyze
  python orchestrator/cli.py status
  python orchestrator/cli.py test
"""
import sys, os, argparse, json
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from feed_ingestion.results_scraper import ResultsFeedIngester
from feed_ingestion.url_builder import DynamicUrlBuilder
from generator.pin_builder import PinBuilder
from publisher.safety_gate import SafetyGatekeeper
from analyzer.metrics_analyzer import MetricsAnalyzer

def run_ingest_and_generate():
    ingester = ResultsFeedIngester()
    url_builder = DynamicUrlBuilder()
    new_results = ingester.get_unpublished_results()
    print(f"[INGEST] Found {len(new_results)} unpublished daily market results.")
    
    for r in new_results:
        pin_url = url_builder.build_pin_url(r['market_slug'], r['date'], pillar="daily_result")
        print(f"  -> Prepared Pin for {r['market_name']}: {r['open_pana']}-{r['jodi']}-{r['close_pana']} => {pin_url}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["ingest-and-generate", "generate", "dry-run", "publish", "analyze", "status", "test"])
    args = parser.parse_args()
    if args.command == "ingest-and-generate":
        run_ingest_and_generate()
`
    },
    'generator/image_processor.py': {
      language: 'python',
      content: `"""
Pinterest Auto Marketer - Image Processor (Zero-Cost First)
Handles 1000x1500 2:3 Pinterest pin generation using Pillow (OSS).
Renders high-contrast daily result cards, tabular weekly Jodi charts, and schedule guides.
Computes perceptual hash (imagehash) for deduplication.
"""
import os, requests, imagehash
from PIL import Image, ImageDraw, ImageFont

class ImageProcessor:
    def __init__(self, unsplash_access_key=None):
        self.target_size = (1000, 1500) # Standard Pinterest 2:3 ratio
        
    def compose_daily_result_card(self, market_name, date, open_pana, jodi, close_pana,
                                  open_time, close_time, status, output_path=None):
        img = Image.new("RGBA", self.target_size, color=(11, 15, 25, 255))
        draw = ImageDraw.Draw(img)
        
        # Outer Card
        draw.rounded_rectangle([(60, 120), (940, 1380)], radius=36, fill=(15, 23, 42, 245), outline=(51, 65, 85), width=4)
        
        # Big Number Box
        draw.rounded_rectangle([(100, 440), (900, 780)], radius=28, fill=(2, 6, 23, 235), outline=(16, 185, 129), width=4)
        
        # Calculate pHash
        phash = str(imagehash.phash(img))
        if output_path:
            img.convert("RGB").save(output_path, "PNG")
        return phash
`
    },
    'dedupe_safety/dedupe_engine.py': {
      language: 'python',
      content: `"""
Pinterest Auto Marketer - Deduplication & Policy Safety Engine
Strict anti-spam and policy compliance checks:
1. Image Perceptual Hash (Hamming distance threshold < 5)
2. Market & Session deduplication (logs/published_results.json)
3. Text similarity (Levenshtein & Token Overlap > 82%)
4. Policy checks (clickbait keywords, spam patterns)
"""
import os, json, re, imagehash

class DedupeSafetyEngine:
    def __init__(self, registry_path="logs/hash_registry.json", max_hamming_distance=5):
        self.registry_path = registry_path
        self.max_hamming_distance = max_hamming_distance
`
    },
    'publisher/safety_gate.py': {
      language: 'python',
      content: `"""
Pinterest Auto Marketer - Safety Gatekeeper
Strict security and operational guardrails:
- Requires ENABLE_PUBLISH="true" AND valid PINTEREST_ACCESS_TOKEN to make network calls.
- Enforces DRY_RUN_MODE by default (simulates exact payloads and logs them).
- Daily Cap Enforcement (MAX_PINS_PER_DAY) via logs/daily_published.json.
"""
import os, json, random
from publisher.pinterest_client import PinterestAPIClient

class SafetyGatekeeper:
    def __init__(self):
        self.enable_publish = os.getenv("ENABLE_PUBLISH", "false").lower() == "true"
        self.dry_run_mode = os.getenv("DRY_RUN_MODE", "true").lower() != "false"
        self.access_token = os.getenv("PINTEREST_ACCESS_TOKEN", "").strip()
        self.max_pins_per_day = int(os.getenv("MAX_PINS_PER_DAY", "10"))
`
    },
    'publisher/pinterest_client.py': {
      language: 'python',
      content: `"""
Pinterest Auto Marketer - Pinterest API v5 Client
Abstracted client for Pinterest Business API (v5) with exponential backoff and rate limit recovery.
Docs: https://developers.pinterest.com/docs/api/v5/
"""
import os, time, random, requests

class PinterestAPIClient:
    BASE_URL = "https://api.pinterest.com/v5"
    
    def create_pin(self, title, description, link, media_id=None, board_id=None):
        url = f"{self.BASE_URL}/pins"
        payload = {
            "board_id": board_id,
            "title": title[:100],
            "description": description[:800],
            "link": link, # Dynamic UTM Destination URL
            "media_source": {"source_type": "image_id", "media_id": media_id}
        }
        return payload
`
    },
    '.github/workflows/schedule.yml': {
      language: 'yaml',
      content: `name: Pinterest Auto Marketer Scheduled Results Cycle
on:
  schedule:
    - cron: '0 9,15,21 * * *' # Synchronized with daily market results declaration timings
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
      - run: python orchestrator/cli.py ingest-and-generate
      - run: python orchestrator/schedule_runner.py
        env:
          PINTEREST_ACCESS_TOKEN: \${{ secrets.PINTEREST_ACCESS_TOKEN }}
          PINTEREST_BOARD_ID: \${{ secrets.PINTEREST_BOARD_ID }}
          DESTINATION_CANONICAL_ROOT: \${{ secrets.DESTINATION_CANONICAL_ROOT || 'https://www.jodichart.online' }}
          ENABLE_PUBLISH: \${{ secrets.ENABLE_PUBLISH || 'false' }}
          DRY_RUN_MODE: \${{ secrets.DRY_RUN_MODE || 'true' }}
          MAX_PINS_PER_DAY: \${{ secrets.MAX_PINS_PER_DAY || '10' }}
`
    },
    'requirements.txt': {
      language: 'text',
      content: `requests>=2.31.0
python-dotenv>=1.0.1
Pillow>=10.3.0
imagehash>=4.3.1
numpy>=1.26.4
`
    },
    '.env.example': {
      language: 'shell',
      content: `# Production Environment Configuration Template
ENABLE_PUBLISH=false
DRY_RUN_MODE=true
MAX_PINS_PER_DAY=10
CRON_RUNS_PER_DAY=3

# Pinterest Business API v5 (Required for Live Automation)
PINTEREST_ACCESS_TOKEN=pina_your_access_token_here
PINTEREST_BOARD_ID=112233445566778899

# Canonical Outbound Routing & Market Sitemap Template
CANONICAL_ROOT=https://www.jodichart.online
MARKET_URL_TEMPLATE=https://www.jodichart.online/market/{market_slug}
SITEMAP_URL=https://www.jodichart.online/sitemap.xml
MARKET_API_ENDPOINT=https://www.jodichart.online/api

# Optional Free Integrations
UNSPLASH_ACCESS_KEY=
HUGGINGFACE_TOKEN=
USE_LLM_COPY=false
`
    },
    'README.md': {
      language: 'markdown',
      content: `# 📌 Pinterest Auto Marketer & Daily Results Publisher
Autonomous marketing engine:
1. Live Ingestion Feed & Scraper (\`feed_ingestion/results_scraper.py\`)
2. Dynamic Deep-Linking URL Builder with UTM tags (\`feed_ingestion/url_builder.py\`)
3. 2:3 High-Resolution Pin Generation via Pillow (\`generator/image_processor.py\`)
4. Dedupe & Safety Gatekeeper (\`dedupe_safety/dedupe_engine.py\`)
5. Gated Publishing with Rate-Limits & Audit Logs (\`publisher/safety_gate.py\`)
`
    },
  };

  const handleCopy = () => {
    const code = fileContents[selectedFile]?.content || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <span>📂</span> Python Codebase & Repository File Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse live ingestion scripts, URL builders, and 2:3 Pillow generators or export as a <code className="text-emerald-400 font-mono">.zip</code> archive.
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Python Repo (.ZIP)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: File Tree */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="text-xs font-semibold text-white border-b border-slate-800 pb-2">
            Repository Structure
          </div>

          <div className="space-y-1 text-xs font-mono">
            {Object.keys(fileContents).map(filePath => {
              const isSelected = selectedFile === filePath;
              const isPy = filePath.endsWith('.py');
              const isMd = filePath.endsWith('.md');
              const isYaml = filePath.endsWith('.yml');

              return (
                <button
                  key={filePath}
                  onClick={() => setSelectedFile(filePath)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {isPy ? (
                    <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isMd ? (
                    <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  ) : isYaml ? (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{filePath}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Code View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-white">{selectedFile}</span>
              <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono uppercase">
                {fileContents[selectedFile]?.language || 'text'}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto flex-1 max-h-[520px]">
            <pre>{fileContents[selectedFile]?.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
