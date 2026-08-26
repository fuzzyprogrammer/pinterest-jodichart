import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Clock, 
  FileCheck, 
  TrendingUp, 
  RefreshCw,
  Terminal,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { AppConfig, AuditLogEntry, StylePerformance } from '../types';

interface DashboardTabProps {
  config: AppConfig;
  todayCount: number;
  auditLogs: AuditLogEntry[];
  performance: StylePerformance[];
  onTriggerCycle: () => void;
  onResetQuota: () => void;
  isSimulating: boolean;
  onNavigateTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  config,
  todayCount,
  auditLogs,
  performance,
  onTriggerCycle,
  onResetQuota,
  isSimulating,
  onNavigateTab,
}) => {
  const isSafe = !config.enable_publish || config.dry_run_mode;
  const remainingToday = Math.max(0, config.max_pins_per_day - todayCount);
  const quotaPercent = Math.min(100, Math.round((todayCount / config.max_pins_per_day) * 100));

  const topStyle = [...performance].sort((a, b) => b.engagement_score - a.engagement_score)[0];

  const simulatedSuccessCount = auditLogs.filter(l => l.status === 'SIMULATED_SUCCESS').length;
  const liveSuccessCount = auditLogs.filter(l => l.status === 'LIVE_SUCCESS').length;
  const rejectedCount = auditLogs.filter(l => l.status === 'REJECTED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Safety Gate Warning & Status Header */}
      <div className={`p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all ${
        isSafe
          ? 'bg-slate-900 border-slate-800 text-slate-200'
          : 'bg-rose-950/30 border-rose-800/60 text-rose-100'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-lg shrink-0 ${
            isSafe ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {isSafe ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-semibold text-sm sm:text-base text-white">
                {isSafe ? 'Simulation & Dry-Run Active (Zero Network Call Risk)' : '⚠️ LIVE PRODUCTION PUBLISHING ENGAGED'}
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isSafe ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {isSafe ? 'DRY_RUN_MODE' : 'API_CALLS_ENABLED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isSafe
                ? 'The autonomous loop generates 1000x1500 images, SEO copy, perceptual hashes, and simulated Pinterest payloads without external HTTP requests.'
                : 'PINTEREST_ACCESS_TOKEN is loaded and ENABLE_PUBLISH=true. Pins will be uploaded directly to your boards with rate limit backoff and anti-spam jitter.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={onTriggerCycle}
            disabled={isSimulating}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg shadow transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'fill-current'}`} />
            <span>{isSimulating ? 'Processing Loop...' : 'Trigger Loop'}</span>
          </button>
        </div>
      </div>

      {/* KPI & Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Cap Budget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Daily Cap Budget</span>
            <button
              onClick={onResetQuota}
              title="Reset today's counter for simulation testing"
              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-white">
              {todayCount} <span className="text-xs font-normal text-slate-400">/ {config.max_pins_per_day}</span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
              remainingToday > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {remainingToday} remaining
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                quotaPercent > 90 ? 'bg-rose-500' : quotaPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Per run: <strong className="text-slate-300 font-mono">{Math.max(1, Math.floor(config.max_pins_per_day / config.cron_runs_per_day))} pins</strong></span>
            <span className="font-mono text-[10px] text-slate-500">{config.cron_runs_per_day}x daily cron</span>
          </p>
        </div>

        {/* Dedupe Protection Blocked */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Dedupe & Policy</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {rejectedCount} <span className="text-xs font-normal text-slate-400">gated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Hamming dist: <strong className="text-slate-300 font-mono">&lt; 5</strong> | Cosine: <strong className="text-slate-300 font-mono">&gt; 82%</strong>
          </p>
        </div>

        {/* Total Processed Pins */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Cycle Pins</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {simulatedSuccessCount + liveSuccessCount} <span className="text-xs font-normal text-slate-400">pins</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Simulated: <strong className="text-slate-300 font-mono">{simulatedSuccessCount}</strong> | Live: <strong className="text-slate-300 font-mono">{liveSuccessCount}</strong>
          </p>
        </div>

        {/* Top Performing Style */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Adaptive Top Style</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg font-bold text-emerald-400 truncate">
            {topStyle ? topStyle.name : 'Clean Infographic'}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Save Rate: <strong className="text-slate-300">{topStyle?.save_rate_pct}%</strong> | CTR: <strong className="text-slate-300">{topStyle?.outbound_ctr_pct}%</strong>
          </p>
        </div>
      </div>

      {/* Main Grid: Architecture Flow & Live Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Autonomous Loop Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Autonomous Marketing Pipeline (Zero-Cost Design)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Continuous deterministic workflow executed in GitHub Actions or CLI</p>
              </div>
              <span className="text-xs text-slate-400 font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded">
                cron: 0 14,17,21 * * *
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
              {/* Step 1 */}
              <div 
                onClick={() => onNavigateTab('research')}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-800/40 group"
              >
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Step 1</span>
                  <span>🔍</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Research</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Free trend heuristics & category taxonomy
                </p>
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => onNavigateTab('pinstudio')}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-800/40 group"
              >
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Step 2</span>
                  <span>🎨</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Generation</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Pillow 1000x1500, CTA overlay, SEO copy
                </p>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => onNavigateTab('safety')}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-800/40 group"
              >
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Step 3</span>
                  <span>🛡️</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Dedupe Guard</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  dHash, text cosine & policy scan
                </p>
              </div>

              {/* Step 4 */}
              <div 
                onClick={() => onNavigateTab('publisher')}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-800/40 group"
              >
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Step 4</span>
                  <span>🚀</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Gated Publish</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Dry-run validator or throttled v5 API
                </p>
              </div>

              {/* Step 5 */}
              <div 
                onClick={() => onNavigateTab('analytics')}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-800/40 group"
              >
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Step 5</span>
                  <span>📈</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Adaptation</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Weights update in adjustments.json
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>CLI: <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">python orchestrator/cli.py dry-run</code></span>
              </div>
              <button
                onClick={() => onNavigateTab('tests')}
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Run Acceptance Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Anti-Flagging Safeguards Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Operational Anti-Flagging Safeguards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                  <span>⏱️</span>
                  <span>Schedule Jitter</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Adds ±30–90m offsets to cron times and 15–45s pauses between consecutive API calls to prevent robotic fingerprints.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                  <span>🔒</span>
                  <span>Dual Safety Gating</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Zero external POSTs unless operator explicitly sets <code className="text-slate-300 font-mono text-[10px]">ENABLE_PUBLISH=true</code> AND provides secret token.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                  <span>🚫</span>
                  <span>Cross-Board Dedupe</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Prevents identical media or topics from publishing to multiple boards on the same calendar day.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                  <span>🔄</span>
                  <span>429 Exponential Backoff</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Gracefully sleeps on rate limits and transient 5xx errors with exponential delay before retry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Audit Log Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-300" />
                Persistent Audit Log Stream
              </h3>
              <p className="text-[11px] font-mono text-slate-400">logs/publish_audit.log</p>
            </div>
            <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              {auditLogs.length} entries
            </span>
          </div>

          {/* Log list */}
          <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1 font-mono text-xs">
            {auditLogs.map((log) => {
              const isSim = log.status === 'SIMULATED_SUCCESS';
              const isLive = log.status === 'LIVE_SUCCESS';
              const isRej = log.status === 'REJECTED';

              return (
                <div 
                  key={log.id} 
                  className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all ${
                    isLive 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                      : isSim 
                      ? 'bg-slate-950 border-slate-800 text-slate-300' 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-sans text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-semibold">
                      {isLive ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : isSim ? (
                        <CheckCircle className="w-3 h-3 text-slate-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-400" />
                      )}
                      <span className={isLive ? 'text-emerald-400' : isSim ? 'text-slate-300' : 'text-rose-400'}>
                        {log.action}
                      </span>
                    </span>
                    <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-300 break-words font-sans text-[11px]">{log.details}</div>
                  <div className="mt-1 text-[10px] text-slate-500 truncate font-mono">
                    ID: {log.pin_id}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="font-mono text-[10px]">JSON Lines Log File</span>
            <button
              onClick={() => onNavigateTab('repo')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View in Repo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
