"""
Pinterest Auto Marketer - Schedule Runner
Handles scheduled cron jobs, calculates per-run allowances to respect MAX_PINS_PER_DAY,
and loops through research -> generation -> dedupe -> gated publishing.
"""

import os
import sys
import time
import math
import random
from dotenv import load_dotenv

# Ensure the project root is in sys.path regardless of execution directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
load_dotenv()

from research_strategy.researcher import ResearchEngine
from generator.pin_builder import PinBuilder
from publisher.safety_gate import SafetyGatekeeper
from analyzer.metrics_analyzer import MetricsAnalyzer

class ScheduleRunner:
    def __init__(self):
        self.max_pins_per_day = int(os.getenv("MAX_PINS_PER_DAY", "10"))
        self.runs_per_day = int(os.getenv("CRON_RUNS_PER_DAY", "3")) # e.g. 3 runs per day
        self.researcher = ResearchEngine()
        self.builder = PinBuilder()
        self.gatekeeper = SafetyGatekeeper()
        self.analyzer = MetricsAnalyzer()

    def calculate_run_budget(self):
        """
        Computes the maximum number of pins this specific cron run is allowed to produce
        without exceeding MAX_PINS_PER_DAY across 24 hours.
        """
        today_count, _ = self.gatekeeper.get_today_publish_count()
        remaining_today = max(0, self.max_pins_per_day - today_count)
        
        per_run_nominal = max(1, math.floor(self.max_pins_per_day / self.runs_per_day))
        effective_budget = min(per_run_nominal, remaining_today)
        return effective_budget, remaining_today, today_count

    def run_cycle(self, force_count=None):
        """
        Executes one full autonomous marketing loop.
        """
        budget, remaining, today_count = self.calculate_run_budget()
        target_count = force_count if force_count is not None else budget

        print(f"=======================================================")
        print(f"🚀 PINTEREST AUTO MARKETER - AUTOMATION CYCLE STARTED")
        print(f"📊 Daily quota: {today_count}/{self.max_pins_per_day} used ({remaining} remaining today)")
        print(f"🎯 Target pins for this run: {target_count}")
        print(f"🔒 Mode: {'LIVE PRODUCTION' if (self.gatekeeper.enable_publish and not self.gatekeeper.dry_run_mode) else 'DRY_RUN (SAFE SIMULATION)'}")
        print(f"=======================================================")

        if target_count <= 0:
            print("[ScheduleRunner] Daily quota already met. Exiting gracefully without making changes.")
            return {"status": "QUOTA_EXHAUSTED", "pins_processed": 0}

        # Step 1: Research Plan (incorporating adaptation from adjustments.json)
        print("\n[1/4] 🔍 Running Topic & Keyword Research...")
        plan = self.researcher.generate_plan(count=target_count, adjustments_path="logs/adjustments.json")
        print(f" -> Generated plan with {len(plan['items'])} items.")

        results = []

        # Step 2 & 3: Generation & Safety-Gated Publishing
        for idx, item in enumerate(plan["items"]):
            print(f"\n[2/4] 🎨 Generating Pin #{idx+1}: '{item['topic_seed']}' (Style: {item['visual_style']})...")
            
            pin_meta = self.builder.build_pin(
                topic_seed=item["topic_seed"],
                category=item["category"],
                target_board=item["target_board"],
                destination_url=item["destination_url"],
                style=item["visual_style"],
                keywords=item["keywords"],
                hashtags=item["hashtags"]
            )

            print(f" -> Generated image: {pin_meta['image_path']} (pHash: {pin_meta['perceptual_hash']})")
            print(f"[3/4] 🛡️ Evaluating Safety & Dispatching Publish...")
            
            publish_res = self.gatekeeper.publish_pin(pin_meta)
            print(f" -> Status: {publish_res['status']} | {publish_res['message']}")
            results.append(publish_res)

            # Add natural randomized delay between sequential pins in same job (unless last pin)
            if idx < len(plan["items"]) - 1:
                delay = random.uniform(2.0, 5.0) if self.gatekeeper.dry_run_mode else random.uniform(15.0, 45.0)
                print(f" -> Pausing {delay:.1f}s for natural distribution...")
                time.sleep(delay)

        # Step 4: Analytics Adaptation
        print("\n[4/4] 📈 Running Adaptation Feedback Loop...")
        adj = self.analyzer.compute_performance_adaptation()
        print(f" -> Updated adjustments.json. Top template: {adj['top_performing_template']}")

        print(f"\n=======================================================")
        print(f"✅ AUTOMATION CYCLE COMPLETE. Processed {len(results)} pins.")
        print(f"=======================================================\n")

        return {
            "status": "COMPLETED",
            "pins_processed": len(results),
            "results": results,
            "adjustments": adj
        }

if __name__ == "__main__":
    runner = ScheduleRunner()
    runner.run_cycle()
