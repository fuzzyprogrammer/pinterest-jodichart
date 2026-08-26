import React, { useState } from 'react';
import { 
  Clock, 
  Copy, 
  Check, 
  ShieldCheck, 
  Key, 
  FileCode2
} from 'lucide-react';
import { AppConfig } from '../types';

interface SchedulerWorkflowTabProps {
  config: AppConfig;
}

export const SchedulerWorkflowTab: React.FC<SchedulerWorkflowTabProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const perRunBudget = Math.max(1, Math.floor(config.max_pins_per_day / config.cron_runs_per_day));

  const workflowCode = `name: Pinterest Auto Marketer Scheduled Cycle

on:
  schedule:
    # Runs 3 times a day at peak Pinterest engagement hours (UTC 14:00, 17:00, 21:00)
    - cron: '0 14,17,21 * * *'
  workflow_dispatch:
    inputs:
      dry_run_override:
        description: 'Force Dry Run (Simulate only)'
        required: true
        type: boolean
        default: true

permissions:
  contents: write

jobs:
  run-marketing-loop:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Execute Autonomous Marketer Cycle
        env:
          PINTEREST_ACCESS_TOKEN: \${{ secrets.PINTEREST_ACCESS_TOKEN }}
          PINTEREST_BOARD_ID: \${{ secrets.PINTEREST_BOARD_ID }}
          ENABLE_PUBLISH: \${{ secrets.ENABLE_PUBLISH || 'false' }}
          DRY_RUN_MODE: \${{ github.event.inputs.dry_run_override != '' && github.event.inputs.dry_run_override || secrets.DRY_RUN_MODE || 'true' }}
          MAX_PINS_PER_DAY: \${{ secrets.MAX_PINS_PER_DAY || '${config.max_pins_per_day}' }}
          CRON_RUNS_PER_DAY: '${config.cron_runs_per_day}'
          UNSPLASH_ACCESS_KEY: \${{ secrets.UNSPLASH_ACCESS_KEY }}
          HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
          USE_LLM_COPY: \${{ secrets.USE_LLM_COPY || 'false' }}
        run: |
          echo "🛡️ Starting Pinterest Auto Marketer cycle..."
          python orchestrator/schedule_runner.py

      - name: Commit and Push Persistent Logs & Hashes
        if: always()
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add logs/daily_published.json logs/hash_registry.json logs/adjustments.json logs/publish_audit.log || true
          git diff --staged --quiet || git commit -m "chore(logs): update daily counters [skip ci]" || true
          git push || true

      - name: Upload Run Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: pinterest-marketer-artifacts-\${{ github.run_id }}
          path: logs/
          retention-days: 14`;

  const handleCopy = () => {
    navigator.clipboard.writeText(workflowCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <span>⏱️</span> GitHub Actions Cron & CI/CD Automation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero-cost scheduled runner in <code className="text-emerald-400 font-mono">.github/workflows/schedule.yml</code> enforcing daily caps and per-run budgets.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Workflow YAML' : 'Copy Workflow YAML'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Budget Calculator & Secrets Setup */}
        <div className="lg:col-span-5 space-y-5">
          {/* Daily Quota Budgeting */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Per-Run Quota Calculation (Safe Throttling)
            </h3>
            
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Maximum Daily Pins (MAX_PINS_PER_DAY):</span>
                <strong className="text-white font-mono">{config.max_pins_per_day} pins / day</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Cron Runs Per Day:</span>
                <strong className="text-white font-mono">{config.cron_runs_per_day} executions</strong>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-medium">
                <span className="text-slate-300">Calculated Budget Per Run:</span>
                <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  {perRunBudget} pins / execution
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              Formula: <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-400">floor(MAX_PINS_PER_DAY / runs_per_day)</code> guarantees 24h limit integrity.
            </p>
          </div>

          {/* Secrets Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              GitHub Repository Secrets Checklist
            </h3>
            
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <code className="text-emerald-400 font-mono font-semibold">ENABLE_PUBLISH</code>
                  <p className="text-[11px] text-slate-400 mt-0.5">Set to <code>"true"</code> only when ready for live Pinterest publishing.</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <code className="text-emerald-400 font-mono font-semibold">DRY_RUN_MODE</code>
                  <p className="text-[11px] text-slate-400 mt-0.5">Set to <code>"false"</code> when going live. Defaults to <code>"true"</code> for safety.</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <code className="text-emerald-400 font-mono font-semibold">PINTEREST_ACCESS_TOKEN</code>
                  <p className="text-[11px] text-slate-400 mt-0.5">OAuth 2.0 token with <code>pins:write, boards:read</code>.</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <code className="text-emerald-400 font-mono font-semibold">PINTEREST_BOARD_ID</code>
                  <p className="text-[11px] text-slate-400 mt-0.5">Target board identifier from Pinterest Business API.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Workflow YAML Code */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              .github/workflows/schedule.yml
            </h3>
            <span className="text-xs text-slate-400 font-mono">YAML</span>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto flex-1 max-h-[500px]">
            <pre>{workflowCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
