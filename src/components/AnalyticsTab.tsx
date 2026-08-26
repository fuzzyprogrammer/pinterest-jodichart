import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  FileText, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { StylePerformance } from '../types';

interface AnalyticsTabProps {
  performance: StylePerformance[];
  onRecalculateAdaptation: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  performance,
  onRecalculateAdaptation,
}) => {
  const sorted = [...performance].sort((a, b) => b.engagement_score - a.engagement_score);
  const topStyle = sorted[0];

  const maxScore = Math.max(...performance.map(p => p.engagement_score), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <span>📈</span> Analytics & Performance-Driven Adaptation Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Computes KPIs across visual styles and updates <code className="text-emerald-400 font-mono">logs/adjustments.json</code> for self-improving prompt generation.
          </p>
        </div>

        <button
          onClick={onRecalculateAdaptation}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-3.5 py-2 rounded-lg shadow transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recompute Matrix</span>
        </button>
      </div>

      {/* Top Winner Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Top Performing Visual Style</div>
            <h3 className="text-base font-semibold text-white">{topStyle.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Achieved highest Engagement Score ({topStyle.engagement_score}) with {topStyle.save_rate_pct}% Save Rate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Save Rate</span>
            <span className="text-sm font-semibold text-emerald-400">{topStyle.save_rate_pct}%</span>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Outbound CTR</span>
            <span className="text-sm font-semibold text-emerald-400">{topStyle.outbound_ctr_pct}%</span>
          </div>
        </div>
      </div>

      {/* Visual Comparison Charts & Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Comparative Bar Graph */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Engagement Score by Visual Template Style
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Score = (SaveRate × 2) + (CTR × 3)</span>
          </div>

          <div className="space-y-4 pt-2">
            {sorted.map(item => {
              const barWidth = Math.round((item.engagement_score / maxScore) * 100);
              const isWinner = item.style === topStyle.style;

              return (
                <div key={item.style} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 flex items-center gap-2">
                      {item.name}
                      {isWinner && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono px-1.5 py-0.2 rounded">
                          Leader
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">{item.engagement_score} pts</span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWinner ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{item.impressions.toLocaleString()} views • {item.saves} saves</span>
                    <span>Save Rate: {item.save_rate_pct}% | CTR: {item.outbound_ctr_pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: adjustments.json Live Preview */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Generated logs/adjustments.json
            </h3>
            <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              v1.0
            </span>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto flex-1 max-h-[380px]">
            <pre>{JSON.stringify({
              version: "1.0",
              updated_at: new Date().toISOString(),
              top_performing_template: topStyle.style,
              recommendations: {
                preferred_visual_template: topStyle.style,
                recommended_cta: topStyle.style === 'clean_infographic' ? 'GET THE CHECKLIST' : 'SAVE FOR LATER',
                recommended_post_hour_utc: 17,
                adaptation_notes: `Template '${topStyle.name}' outperformed with ${topStyle.engagement_score} engagement score. Increasing allocation in upcoming research plans.`
              }
            }, null, 2)}</pre>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Fed automatically into Step 1 Research</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Feedback
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
