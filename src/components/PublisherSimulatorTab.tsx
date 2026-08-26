import React, { useState } from 'react';
import { 
  Layers, 
  Send, 
  Code2
} from 'lucide-react';
import { PinCandidate, AppConfig, AuditLogEntry } from '../types';

interface PublisherSimulatorTabProps {
  candidates: PinCandidate[];
  config: AppConfig;
  todayCount: number;
  onPublishPin: (pin: PinCandidate, forceRateLimit?: boolean) => void;
  auditLogs: AuditLogEntry[];
  isPublishing: boolean;
  onNavigateTab: (tab: string) => void;
}

export const PublisherSimulatorTab: React.FC<PublisherSimulatorTabProps> = ({
  candidates,
  config,
  todayCount,
  onPublishPin,
  auditLogs,
  isPublishing,
  onNavigateTab,
}) => {
  const [selectedPin, setSelectedPin] = useState<PinCandidate | null>(candidates[0] || null);
  const [simulateRateLimit429, setSimulateRateLimit429] = useState(false);

  const isSafe = !config.enable_publish || config.dry_run_mode;
  const isCapped = todayCount >= config.max_pins_per_day;

  const currentPin = selectedPin || candidates[0];

  const handleTriggerPublish = () => {
    if (!currentPin) return;
    onPublishPin(currentPin, simulateRateLimit429);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <span>🚀</span> Pinterest API v5 Publisher & Dry-Run Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gated publishing workflow in <code className="text-emerald-400 font-mono">publisher/safety_gate.py</code> with exponential backoff and payload serialization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded font-mono font-medium border ${
            isSafe
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {isSafe ? 'TEST SIMULATION ACTIVE' : 'LIVE API ACTIVE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Candidate Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Generated Pin Candidates
              </h3>
              <span className="text-xs bg-slate-950 border border-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                {candidates.length} in queue
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {candidates.map((c) => {
                const isSelected = currentPin?.pin_id === c.pin_id;
                return (
                  <div
                    key={c.pin_id}
                    onClick={() => setSelectedPin(c)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt="Pin thumbnail"
                          className="w-12 h-18 object-cover rounded shrink-0 border border-slate-800"
                        />
                      ) : (
                        <div className="w-12 h-18 bg-slate-800 rounded shrink-0 flex items-center justify-center text-[10px] text-slate-500">
                          2:3
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                          <span className="font-mono text-emerald-400">{c.pin_id.slice(0, 16)}...</span>
                          <span className="capitalize text-slate-500">{c.visual_style.replace('_', ' ')}</span>
                        </div>
                        <div className="font-semibold text-slate-200 line-clamp-2 text-xs">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>Board: {c.board_name}</span>
                          <span className="text-[10px] font-mono text-slate-500">pHash: {c.perceptual_hash.slice(0, 8)}</span>
                        </div>
                        {c.matched_sitemap_loc && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                            <span className="text-amber-400/90 font-mono truncate max-w-[170px]" title={c.matched_sitemap_loc}>
                              🔗 {c.matched_sitemap_loc.replace('https://www.jodichart.online', '')}
                            </span>
                            <span className="text-emerald-400 font-mono">
                              ✓ Sitemap
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Payload Inspector & Dispatch Simulator */}
        <div className="lg:col-span-7 space-y-4">
          {currentPin ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    Pinterest API v5 Outbound Request Payload
                  </h3>
                  <p className="text-xs text-slate-400">Endpoint: <code className="text-emerald-400 font-mono">POST https://api.pinterest.com/v5/pins</code></p>
                </div>
                <span className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Bearer {config.pinterest_access_token ? '***' : '[TEST_TOKEN]'}
                </span>
              </div>

              {/* JSON Payload Inspector */}
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto">
                <pre>{JSON.stringify({
                  board_id: config.pinterest_board_id || "BOARD_ID_NORDIC_LIVING_1029",
                  title: currentPin.title,
                  description: currentPin.description,
                  link: currentPin.destination_url,
                  alt_text: currentPin.title,
                  media_source: {
                    source_type: "image_id",
                    media_id: `media_${currentPin.perceptual_hash.slice(0, 8)}`
                  }
                }, null, 2)}</pre>
              </div>

              {/* Anti-Spam & Simulation Controls */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Anti-Flagging & Backoff Simulation:</span>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={simulateRateLimit429}
                      onChange={e => setSimulateRateLimit429(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                    />
                    <span className="text-amber-400 font-medium">Simulate HTTP 429 (Trigger Backoff)</span>
                  </label>
                </div>

                <div className="text-[11px] text-slate-400">
                  {simulateRateLimit429 ? (
                    <span className="text-amber-400 font-mono text-[10px]">
                      ⚡ Simulates Pinterest rate limit with Retry-After header and exponential backoff retry.
                    </span>
                  ) : (
                    <span className="font-sans">
                      🕒 Execution will include randomized 2–5s jitter and record payload directly into persistent audit log.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400 font-mono">
                  Daily Quota: <strong className="text-slate-200">{todayCount} / {config.max_pins_per_day}</strong> used
                </div>

                <button
                  onClick={handleTriggerPublish}
                  disabled={isPublishing || isCapped}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isPublishing ? 'animate-bounce' : ''}`} />
                  <span>
                    {isPublishing
                      ? 'Dispatching Request...'
                      : isCapped
                      ? 'Daily Cap Reached'
                      : isSafe
                      ? 'Simulate Publish (Dry-Run)'
                      : 'Publish Live to Pinterest'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
              Select or generate a candidate pin from Pin Studio to inspect API payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
