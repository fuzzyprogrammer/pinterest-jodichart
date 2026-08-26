import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, Key, Settings, Globe, Link2, CheckCircle2 } from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (updated: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<AppConfig>(config);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

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
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">System, Routing & Safety Configuration</h2>
            <p className="text-xs text-slate-400">Environment flags, Pinterest tokens, and dynamic destination URL routing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Destination URL Routing Architecture */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Destination URL Routing & Deep-Linking Architecture
            </h3>
            <p className="text-slate-400 text-[11px]">
              Pins automatically attach these routes and UTM tags to the Pinterest API <code className="text-emerald-400 font-mono">link</code> parameter.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Canonical Website Domain (Root)</label>
                <input
                  type="url"
                  value={formData.routing_config?.canonical_root || 'https://www.jodichart.online'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      brand_url: e.target.value,
                      routing_config: {
                        ...formData.routing_config,
                        canonical_root: e.target.value,
                      },
                    })
                  }
                  placeholder="https://www.jodichart.online"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium text-[11px] flex items-center justify-between">
                    <span>Live Data API Endpoint</span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">Scraper/Feeds</span>
                  </label>
                  <input
                    type="url"
                    value={formData.routing_config?.api_endpoint || 'https://www.jodichart.online/api'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        routing_config: {
                          ...formData.routing_config,
                          api_endpoint: e.target.value,
                        },
                      })
                    }
                    placeholder="https://www.jodichart.online/api"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium text-[11px] flex items-center justify-between">
                    <span>Sitemap XML (URL Linking)</span>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">Pinterest Links</span>
                  </label>
                  <input
                    type="url"
                    value={formData.routing_config?.sitemap_url || 'https://www.jodichart.online/sitemap.xml'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        routing_config: {
                          ...formData.routing_config,
                          sitemap_url: e.target.value,
                        },
                      })
                    }
                    placeholder="https://www.jodichart.online/sitemap.xml"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Daily Results URL Pattern</label>
                  <input
                    type="text"
                    value={formData.routing_config?.results_path_template || '/results/{market_slug}?date={date}'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        routing_config: {
                          ...formData.routing_config,
                          results_path_template: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Historical Charts URL Pattern</label>
                  <input
                    type="text"
                    value={formData.routing_config?.charts_path_template || '/charts/{market_slug}-panel-chart'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        routing_config: {
                          ...formData.routing_config,
                          charts_path_template: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">UTM Source</label>
                  <input
                    type="text"
                    value={formData.routing_config?.utm_source || 'pinterest'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        routing_config: {
                          ...formData.routing_config,
                          utm_source: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">UTM Medium</label>
                  <input
                    type="text"
                    value={formData.routing_config?.utm_medium || 'organic_pin'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        routing_config: {
                          ...formData.routing_config,
                          utm_medium: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Campaign Pattern</label>
                  <input
                    type="text"
                    value={formData.routing_config?.utm_campaign_template || '{market_slug}_{pillar}'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        routing_config: {
                          ...formData.routing_config,
                          utm_campaign_template: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Safety Gate Controls */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Safety Gatekeeper Switches
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">ENABLE_PUBLISH</span>
                  <span className="text-[11px] text-slate-400">Must be true to allow external Pinterest API calls.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enable_publish}
                  onChange={e => setFormData({ ...formData, enable_publish: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">DRY_RUN_MODE</span>
                  <span className="text-[11px] text-slate-400">Simulates payloads and logs actions safely without external POSTs.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.dry_run_mode}
                  onChange={e => setFormData({ ...formData, dry_run_mode: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer accent-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Quota Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">MAX_PINS_PER_DAY (Cap)</label>
              <input
                type="number"
                min="1"
                max="25"
                value={formData.max_pins_per_day}
                onChange={e => setFormData({ ...formData, max_pins_per_day: parseInt(e.target.value) || 10 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">CRON_RUNS_PER_DAY</label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.cron_runs_per_day}
                onChange={e => setFormData({ ...formData, cron_runs_per_day: parseInt(e.target.value) || 3 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Pinterest Business Tokens */}
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Pinterest Business API Tokens
            </h3>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">PINTEREST_ACCESS_TOKEN</label>
              <input
                type="password"
                value={formData.pinterest_access_token}
                onChange={e => setFormData({ ...formData, pinterest_access_token: e.target.value })}
                placeholder="pina_..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">PINTEREST_BOARD_ID</label>
              <input
                type="text"
                value={formData.pinterest_board_id}
                onChange={e => setFormData({ ...formData, pinterest_board_id: e.target.value })}
                placeholder="e.g. 1029384756"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Persisted locally in browser storage across page refreshes.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold cursor-pointer shadow flex items-center gap-1.5 transition-colors"
              >
                {savedNotice ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Keep Persisted</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
