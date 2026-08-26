import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  BookOpen, 
  Settings, 
  Play, 
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';
import { AppConfig } from '../types';

interface NavbarProps {
  config: AppConfig;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  todayCount: number;
  onOpenSettings: () => void;
  onOpenRunbook: () => void;
  onDownloadZip: () => void;
  onQuickSimulate: () => void;
  isSimulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  activeTab,
  setActiveTab,
  todayCount,
  onOpenSettings,
  onOpenRunbook,
  onDownloadZip,
  onQuickSimulate,
  isSimulating,
}) => {
  const isSafeMode = !config.enable_publish || config.dry_run_mode;

  const navItems = [
    { id: 'dashboard', label: 'Mission Control', icon: '📊' },
    { id: 'research', label: 'Trend Research', icon: '🔍' },
    { id: 'pinstudio', label: '2:3 Pin Studio', icon: '🎨' },
    { id: 'safety', label: 'Safety & Dedupe', icon: '🛡️' },
    { id: 'publisher', label: 'Publisher & Dry-Run', icon: '🚀' },
    { id: 'analytics', label: 'Adaptation Engine', icon: '📈' },
    { id: 'scheduler', label: 'CI / GitHub Actions', icon: '⏱️' },
    { id: 'repo', label: 'Repo Explorer', icon: '📂' },
    { id: 'tests', label: 'Acceptance Tests', icon: '🧪' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Top Banner: Status & System Diagnostics */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isSafeMode ? (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium font-mono">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span>DRY_RUN_MODE: ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-xs font-medium font-mono animate-pulse">
                <div className="w-2 h-2 bg-rose-400 rounded-full" />
                <span>LIVE_PUBLISH: ENGAGED</span>
              </div>
            )}

            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full text-slate-300 text-xs font-mono">
              <span className="text-emerald-400">●</span>
              <span>SAFETY GATED</span>
            </div>
          </div>

          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline text-xs">
            Daily Cap: <strong className="text-slate-200 font-mono">{todayCount} / {config.max_pins_per_day}</strong> pins
          </span>
          <span className="text-slate-700 hidden lg:inline">|</span>
          <span className="text-slate-400 hidden lg:inline text-xs">
            Architecture: <span className="text-emerald-400 font-mono">Zero-Cost First (Pillow + Unsplash + Actions)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRunbook}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/80 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Runbook</span>
          </button>

          <button
            onClick={onDownloadZip}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            title="Download full runnable Python codebase + CI workflows"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .ZIP</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            title="Configure Safety Gates & API Tokens"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-15">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-base shadow-sm">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                Pinterest Auto Marketer
              </h1>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                v1.0.0-proto
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-Cost Autonomous Marketing Loop with Strict Policy & Dedupe Guards
            </p>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onQuickSimulate}
            disabled={isSimulating}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSimulating ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Loop...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate 1 Loop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-900 border-t border-slate-800/80 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-1.5">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
