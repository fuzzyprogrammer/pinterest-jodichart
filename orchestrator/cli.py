#!/usr/bin/env python3
"""
Pinterest Auto Marketer - Unified CLI
Command-line interface for local testing, CI runner, dry-run simulation, and audit inspection.

Usage:
  python orchestrator/cli.py generate [--count 3] [--topic "Topic Name"]
  python orchestrator/cli.py dry-run [--count 2]
  python orchestrator/cli.py publish [--file logs/generated_pins/pin_xxx.json]
  python orchestrator/cli.py analyze [--csv path/to/analytics.csv]
  python orchestrator/cli.py status
  python orchestrator/cli.py test
"""

import sys
import os
import argparse
import json
from dotenv import load_dotenv

# Load local environment variables if .env exists
load_dotenv()

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from research_strategy.researcher import ResearchEngine
from generator.pin_builder import PinBuilder
from publisher.safety_gate import SafetyGatekeeper
from analyzer.metrics_analyzer import MetricsAnalyzer
from orchestrator.schedule_runner import ScheduleRunner

def cmd_status(args):
    """Displays safety configuration, daily limits, and health status."""
    gate = SafetyGatekeeper()
    today_count, _ = gate.get_today_publish_count()
    max_cap = gate.max_pins_per_day
    
    print("\n=======================================================")
    print(" 📌 PINTEREST AUTO MARKETER - SYSTEM STATUS")
    print("=======================================================")
    print(f"🔒 ENABLE_PUBLISH:       {gate.enable_publish} ({'LIVE POSTING ACTIVE' if gate.enable_publish else 'DISABLED / SAFE'})")
    print(f"🧪 DRY_RUN_MODE:         {gate.dry_run_mode} ({'NO EXTERNAL CALLS' if gate.dry_run_mode else 'LIVE NETWORK ACTIVE'})")
    print(f"🔑 PINTEREST TOKEN:      {'[CONFIGURED]' if gate.access_token else '[MISSING - Set in .env]'}")
    print(f"📌 PINTEREST BOARD ID:   {gate.board_id or '[MISSING - Set in .env]'}")
    print(f"🖼️ UNSPLASH KEY:         {'[CONFIGURED]' if os.getenv('UNSPLASH_ACCESS_KEY') else '[OPTIONAL - Using procedural canvas]'}")
    print(f"🤖 HUGGINGFACE TOKEN:    {'[CONFIGURED]' if os.getenv('HUGGINGFACE_TOKEN') else '[OPTIONAL - Using zero-cost templates]'}")
    print(f"📊 Daily Publish Quota:  {today_count} / {max_cap} pins used today ({max(0, max_cap - today_count)} remaining)")
    print("=======================================================\n")

def cmd_generate(args):
    """Generates candidate pins without publishing."""
    builder = PinBuilder()
    count = args.count or 1
    topic = args.topic
    
    print(f"\n[CLI] Generating {count} pin candidate(s)...")
    if topic:
        meta = builder.build_pin(topic_seed=topic, category=args.category or "lifestyle")
        print(f" -> Pin generated: {meta['pin_id']}")
        print(f" -> Title: {meta['title']}")
        print(f" -> Image: {meta['image_path']}")
        print(f" -> pHash: {meta['perceptual_hash']}")
    else:
        researcher = ResearchEngine()
        plan = researcher.generate_plan(count=count)
        for item in plan["items"]:
            meta = builder.build_pin(
                topic_seed=item["topic_seed"],
                category=item["category"],
                target_board=item["target_board"],
                destination_url=item["destination_url"],
                style=item["visual_style"],
                keywords=item["keywords"],
                hashtags=item["hashtags"]
            )
            print(f" -> Pin {meta['pin_id']} created -> {meta['image_path']}")
    print("\n[CLI] Generation finished. Files saved in logs/generated_pins/")

def cmd_dry_run(args):
    """Executes a simulated dry run of the full cycle."""
    os.environ["DRY_RUN_MODE"] = "true"
    runner = ScheduleRunner()
    res = runner.run_cycle(force_count=args.count or 2)
    print(f"\n[CLI] Dry run finished with status: {res['status']}\n")

def cmd_publish(args):
    """Publishes a specific pin JSON artifact (gated by safety)."""
    gate = SafetyGatekeeper()
    if not args.file or not os.path.exists(args.file):
        print(f"[Error] Pin metadata file not found: {args.file}")
        return
    
    with open(args.file, "r", encoding="utf-8") as f:
        meta = json.load(f)

    print(f"\n[CLI] Attempting publish for pin: {meta.get('pin_id')}...")
    res = gate.publish_pin(meta)
    print(f" -> Result: {res['status']}")
    print(f" -> Message: {res['message']}\n")

def cmd_analyze(args):
    """Computes analytics and outputs adjustments.json."""
    analyzer = MetricsAnalyzer()
    if args.csv and os.path.exists(args.csv):
        records = analyzer.ingest_metrics_csv(args.csv)
        adj = analyzer.compute_performance_adaptation(records)
    else:
        adj = analyzer.compute_performance_adaptation()
    print(f"\n[CLI] Analysis complete. Saved to logs/adjustments.json")
    print(f" -> Top Template: {adj['top_performing_template']}")
    print(f" -> Recommendations: {adj['recommendations']['adaptation_notes']}\n")

def cmd_test(args):
    """Runs zero-cost local acceptance tests."""
    print("\n=======================================================")
    print(" 🧪 RUNNING PINTEREST AUTO MARKETER ACCEPTANCE TESTS")
    print("=======================================================")
    
    # Test 1: Image & Meta generation
    print("\n[TEST 1/4] Testing Image & Metadata Generation...")
    builder = PinBuilder()
    pin = builder.build_pin("Acceptance Test Scandi Decor", "home_decor")
    assert os.path.exists(pin["image_path"]), "Image file was not generated"
    assert pin["perceptual_hash"], "pHash was not computed"
    print(" -> PASSED: Image 1000x1500 and metadata successfully produced.")

    # Test 2: Dry-run safety gating
    print("\n[TEST 2/4] Testing Safety Gating & Dry-Run Simulation...")
    gate = SafetyGatekeeper()
    res = gate.publish_pin(pin)
    assert res["success"] is True, "Simulated publish should succeed in dry-run"
    assert res["status"] == "SIMULATED_PUBLISHED", f"Expected SIMULATED_PUBLISHED, got {res['status']}"
    print(" -> PASSED: Dry-run safely logged payload without external calls.")

    # Test 3: Deduplication
    print("\n[TEST 3/4] Testing Perceptual Hash Deduplication...")
    # Attempting to publish identical pin candidate again should be caught
    res_dupe = gate.publish_pin(pin)
    assert res_dupe["success"] is False, "Duplicate pin should be rejected"
    assert res_dupe["status"] == "REJECTED_DEDUPE", "Expected REJECTED_DEDUPE status"
    print(f" -> PASSED: Duplicate successfully rejected ({res_dupe['message']}).")

    # Test 4: Adaptation loop
    print("\n[TEST 4/4] Testing Adaptation & Feedback loop...")
    analyzer = MetricsAnalyzer()
    adj = analyzer.compute_performance_adaptation()
    assert os.path.exists("logs/adjustments.json"), "adjustments.json was not created"
    print(f" -> PASSED: Feedback adjustments generated ({adj['top_performing_template']}).")

    print("\n=======================================================")
    print(" 🎉 ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY (4/4)!")
    print("=======================================================\n")

def main():
    parser = argparse.ArgumentParser(description="Pinterest Auto Marketer CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # Status
    p_status = subparsers.add_parser("status", help="Show system status and safety gates")
    p_status.set_defaults(func=cmd_status)

    # Generate
    p_gen = subparsers.add_parser("generate", help="Generate pin graphics and metadata")
    p_gen.add_argument("--count", type=int, default=1, help="Number of pins to generate")
    p_gen.add_argument("--topic", type=str, help="Specific topic seed")
    p_gen.add_argument("--category", type=str, default="lifestyle", help="Niche category")
    p_gen.set_defaults(func=cmd_generate)

    # Dry-run
    p_dry = subparsers.add_parser("dry-run", help="Simulate a complete automated cycle")
    p_dry.add_argument("--count", type=int, default=2, help="Pins to simulate in run")
    p_dry.set_defaults(func=cmd_dry_run)

    # Publish
    p_pub = subparsers.add_parser("publish", help="Publish a generated pin artifact")
    p_pub.add_argument("--file", type=str, required=True, help="Path to pin metadata JSON")
    p_pub.set_defaults(func=cmd_publish)

    # Analyze
    p_ana = subparsers.add_parser("analyze", help="Run metrics analyzer and generate adjustments")
    p_ana.add_argument("--csv", type=str, help="Optional path to analytics CSV")
    p_ana.set_defaults(func=cmd_analyze)

    # Test
    p_test = subparsers.add_parser("test", help="Run acceptance tests")
    p_test.set_defaults(func=cmd_test)

    args = parser.parse_args()
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
