import React from 'react';
import { X, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RunbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RunbookModal: React.FC<RunbookModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Operator Runbook: Safe Live Publishing</h2>
            <p className="text-xs text-slate-400">Step-by-step ramp-up strategy to prevent account flags or shadowbans</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Paragraph 1: Verification & Pre-Flight */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1. Safe Verification & Dry-Run Phase (Days 1–7)
            </h3>
            <p className="text-slate-400">
              Before activating live publishing, keep <code className="text-emerald-400 font-mono">DRY_RUN_MODE=true</code> and <code className="text-emerald-400 font-mono">ENABLE_PUBLISH=false</code> for at least 7 days. This allows the autonomous engine to generate candidate pins, compute perceptual hashes, and log simulated payloads to <code className="text-slate-200 font-mono">logs/publish_audit.log</code>. Review the generated images and copy to ensure high quality and zero duplicate triggers. Simultaneously, warm up your Pinterest account by manually creating 3–5 niche boards, saving high-authority pins, and verifying your website domain in the Pinterest Business dashboard.
            </p>
          </div>

          {/* Paragraph 2: Staged Ramp-Up */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              2. Staged Ramp-Up Schedule (Days 8–60+)
            </h3>
            <p className="text-slate-400">
              To establish trusted account health heuristics, start by setting <code className="text-emerald-400 font-mono">MAX_PINS_PER_DAY=3</code> (1 pin per scheduled run across 3 cron intervals). Maintain this conservative rate for the first 14 days. If Save and Click rates are healthy, increment to <code className="text-slate-200 font-mono">MAX_PINS_PER_DAY=5</code> for Days 15–30, and reach the maximum equilibrium of <code className="text-slate-200 font-mono">MAX_PINS_PER_DAY=10</code> only after 60 days of continuous good standing. Never post more than 10 pins/day from automated scripts.
            </p>
          </div>

          {/* Anti-Flagging Operational Rules */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Strict Anti-Flagging Checklist:</h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
              <li><strong>Jitter Offsets</strong>: Ensure cron executions have randomized ±30–90m offsets and sequential pins pause for 15–45 seconds.</li>
              <li><strong>Perceptual Deduplication</strong>: Never bypass the Hamming distance threshold (&lt; 5) check; unique imagery is essential.</li>
              <li><strong>URL Diversity</strong>: Distribute pins across specific deep URLs and varied UTM content parameters.</li>
              <li><strong>429 Rate Limits</strong>: The engine handles HTTP 429 via exponential backoff; if 429s persist, reduce daily volume.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold cursor-pointer shadow transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
