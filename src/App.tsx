/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  AppConfig, 
  TopicSeed, 
  PinCandidate, 
  AuditLogEntry, 
  StylePerformance, 
  PlanItem, 
  VisualStyle 
} from './types';
import { 
  initialConfig, 
  initialTopics, 
  initialAuditLogs, 
  initialPerformance,
  sampleCuratedBackgrounds 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { ResearchTab } from './components/ResearchTab';
import { PinStudioTab } from './components/PinStudioTab';
import { SafetyDedupeTab } from './components/SafetyDedupeTab';
import { PublisherSimulatorTab } from './components/PublisherSimulatorTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { SchedulerWorkflowTab } from './components/SchedulerWorkflowTab';
import { RepoExplorerTab } from './components/RepoExplorerTab';
import { AcceptanceTestsTab } from './components/AcceptanceTestsTab';
import { RunbookModal } from './components/RunbookModal';
import { SettingsModal } from './components/SettingsModal';
import { downloadRepositoryZip } from './utils/zipExporter';
import { generatePseudoPerceptualHash, buildTrackedUrl } from './utils/hashUtils';

const CONFIG_STORAGE_KEY = 'pinterest_marketer_config_v1';

function getStoredConfig(): AppConfig {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...initialConfig,
          ...parsed,
          routing_config: {
            ...initialConfig.routing_config,
            ...(parsed.routing_config || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Failed to load stored config', e);
    }
  }
  return initialConfig;
}

export default function App() {
  // App Global State
  const [config, setConfig] = useState<AppConfig>(getStoredConfig);

  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save config to localStorage', e);
    }
  };
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [topics, setTopics] = useState<TopicSeed[]>(initialTopics);
  const [todayCount, setTodayCount] = useState<number>(2);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [performance, setPerformance] = useState<StylePerformance[]>(initialPerformance);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Modals
  const [isRunbookOpen, setIsRunbookOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Active Plan State
  const [plan, setPlan] = useState<PlanItem[]>([
    {
      plan_id: 'plan_20260825_01',
      category: 'daily_results',
      topic_seed: 'Kalyan Day Live Result & Fast Jodi Open Record',
      headline_prompt: 'Kalyan Day Today Live Result (25 Aug 2026) | Fast Jodi & Pana Record',
      keywords: ['kalyan result', 'kalyan jodi chart', 'today live matka', 'kalyan open pana'],
      hashtags: ['#kalyanresult', '#jodichart', '#liveresults', '#matkachart', '#todayopen'],
      target_board: 'Kalyan Live Results & Charts',
      destination_url: 'https://www.jodichart.online/results/kalyan?date=2026-08-25&utm_source=pinterest&utm_medium=organic_pin&utm_campaign=kalyan_daily_result',
      visual_style: 'bold_quote',
      scheduled_hour_utc: 15,
      jitter_minutes: 15,
    },
    {
      plan_id: 'plan_20260825_02',
      category: 'weekly_charts',
      topic_seed: 'Milan Night Full Jodi & Panel Chart Record',
      headline_prompt: 'Milan Night Full Jodi Panel Chart (August 2026 Record)',
      keywords: ['milan night chart', 'milan jodi record', 'panel chart online', 'milan close pana'],
      hashtags: ['#milannight', '#jodichart', '#panelchart', '#matkarecords'],
      target_board: 'Milan Night Records',
      destination_url: 'https://www.jodichart.online/charts/milan-night-panel-chart?utm_source=pinterest&utm_medium=organic_pin&utm_campaign=milan-night_weekly_chart',
      visual_style: 'clean_infographic',
      scheduled_hour_utc: 21,
      jitter_minutes: -10,
    },
    {
      plan_id: 'plan_20260825_03',
      category: 'market_timings',
      topic_seed: '2026 Updated Market Timetable & Opening Schedule',
      headline_prompt: '2026 All Market Timetable & Opening/Closing Schedule',
      keywords: ['matka timings', 'kalyan time table', 'main bazar timing', 'market schedule'],
      hashtags: ['#markettimings', '#kalyantiming', '#jodichart', '#matkaschedule'],
      target_board: 'Market Timings & Schedules',
      destination_url: 'https://www.jodichart.online/timings/all-markets-schedule?utm_source=pinterest&utm_medium=organic_pin&utm_campaign=timings_guide',
      visual_style: 'modern_minimalist',
      scheduled_hour_utc: 12,
      jitter_minutes: 20,
    },
  ]);

  // Candidates Queue
  const [candidates, setCandidates] = useState<PinCandidate[]>([
    {
      pin_id: 'pin_kalyan_20260825_8b31a2',
      created_at: '2026-08-25T14:00:01Z',
      category: 'daily_results',
      topic_seed: 'Kalyan Day Live Result (2026-08-25)',
      title: 'Kalyan Day Today Live Result (25 Aug 2026) | Fast Jodi & Pana Record',
      description: 'Fastest live update for Kalyan Day today (2026-08-25). Open Pana: 348, Jodi: 56, Close Pana: 789. Check full panel chart, weekly records, and daily timings. #kalyanresult #sattamatka #jodichart #panelchart',
      cta: 'CHECK LIVE TIMINGS',
      board_name: 'Kalyan Live Results & Charts',
      destination_url: 'https://www.jodichart.online/results/kalyan?date=2026-08-25&utm_source=pinterest&utm_medium=organic_pin&utm_campaign=kalyan_daily_result&utm_content=bold_quote_20260825',
      base_url: 'https://www.jodichart.online',
      visual_style: 'bold_quote',
      layout_type: 'daily_result',
      market_data: {
        market_name: 'Kalyan Day',
        date: '2026-08-25',
        open_pana: '348',
        jodi: '56',
        close_pana: '789',
        status: 'FULL_DECLARED',
        open_time: '03:45 PM',
        close_time: '05:45 PM',
      },
      dimensions: [1000, 1500],
      perceptual_hash: 'e1f0c2394b88a910',
      average_hash: '019a884b932c0f1e',
      attribution: {
        source: 'Procedural Canvas',
        photographer: 'Market Feeds Scraper',
        photographer_url: 'https://www.jodichart.online',
      },
      keywords: ['kalyan', 'daily result', 'jodi chart', 'panel chart', 'open pana'],
      hashtags: ['#kalyan', '#liveresults', '#jodichart', '#matkaresult'],
      status: 'candidate',
    },
    {
      pin_id: 'pin_milan_20260825_4c99d1',
      created_at: '2026-08-25T17:00:02Z',
      category: 'weekly_charts',
      topic_seed: 'Milan Night Panel Chart Record (2026-08-25)',
      title: 'Milan Night Weekly Jodi Panel Chart Record | Complete Analysis',
      description: 'Historical 7-day Jodi panel chart summary and records for Milan Night. Check Open-Close pana and full month records online. #milannight #jodichart #panelchart',
      cta: 'VIEW FULL PANEL CHART',
      board_name: 'Milan Night Records',
      destination_url: 'https://www.jodichart.online/charts/milan-night-panel-chart?utm_source=pinterest&utm_medium=organic_pin&utm_campaign=milan-night_weekly_chart&utm_content=clean_infographic_20260825',
      base_url: 'https://www.jodichart.online',
      visual_style: 'clean_infographic',
      layout_type: 'weekly_chart',
      market_data: {
        market_name: 'Milan Night',
        date: '2026-08-25',
        open_pana: '249',
        jodi: '58',
        close_pana: '369',
        status: 'FULL_DECLARED',
        open_time: '09:00 PM',
        close_time: '11:00 PM',
      },
      dimensions: [1000, 1500],
      perceptual_hash: 'a2c4e68012345678',
      average_hash: '87654321086e4c2a',
      attribution: {
        source: 'Procedural Canvas',
        photographer: 'Market Feeds Scraper',
        photographer_url: 'https://www.jodichart.online',
      },
      keywords: ['milan night', 'panel chart', 'jodi chart', 'weekly summary'],
      hashtags: ['#milannight', '#jodichart', '#panelchart', '#matkachart'],
      status: 'candidate',
    },
  ]);

  // Top performing style
  const topPerformingStyle: VisualStyle = [...performance].sort((a, b) => b.engagement_score - a.engagement_score)[0].style;

  // Actions
  const handleGeneratePlan = () => {
    const activeSeeds = topics.filter(t => t.active);
    const selected = activeSeeds.length > 0 ? activeSeeds : topics;
    
    const newItems: PlanItem[] = selected.slice(0, 4).map((t, idx) => {
      const styles: VisualStyle[] = ['modern_minimalist', 'warm_editorial', 'clean_infographic', 'bold_quote', 'aesthetic_pastel'];
      const chosenStyle = idx % 2 === 0 ? topPerformingStyle : styles[idx % styles.length];
      const hours = [14, 17, 21, 23];
      const jitter = Math.floor(Math.random() * 60) - 30;

      return {
        plan_id: `plan_${Date.now()}_${idx + 1}`,
        category: t.category,
        topic_seed: t.topic_seed,
        headline_prompt: `${t.topic_seed}: 10 Simple Hacks for 2026`,
        keywords: t.keywords,
        hashtags: t.keywords.map(k => `#${k.replace(/\s+/g, '')}`),
        target_board: t.target_board,
        destination_url: t.destination_url,
        visual_style: chosenStyle,
        scheduled_hour_utc: hours[idx % hours.length],
        jitter_minutes: jitter,
      };
    });

    setPlan(newItems);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.3 } });
  };

  const handleSaveCandidate = (pin: PinCandidate) => {
    setCandidates(prev => [pin, ...prev]);
  };

  const handlePublishPin = (pin: PinCandidate, forceRateLimit = false) => {
    setIsPublishing(true);

    setTimeout(() => {
      setIsPublishing(false);

      if (todayCount >= config.max_pins_per_day) {
        const entry: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'THROTTLED',
          action: 'DAILY_CAP',
          pin_id: pin.pin_id,
          details: `Daily cap reached (${todayCount}/${config.max_pins_per_day} pins). Refusing publication for safety.`,
          payload_snapshot: {},
        };
        setAuditLogs(prev => [entry, ...prev]);
        return;
      }

      if (forceRateLimit) {
        // Simulate 429 and backoff
        const entry: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'FAILED',
          action: '429_RATE_LIMIT_BACKOFF',
          pin_id: pin.pin_id,
          details: 'HTTP 429 Too Many Requests. Pinterest rate limit detected. Applied 4.5s exponential backoff and randomized jitter.',
          payload_snapshot: {},
        };
        setAuditLogs(prev => [entry, ...prev]);
        return;
      }

      const isLive = config.enable_publish && !config.dry_run_mode && Boolean(config.pinterest_access_token);

      const newLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: isLive ? 'LIVE_SUCCESS' : 'SIMULATED_SUCCESS',
        action: isLive ? 'PIN_CREATE' : 'DRY_RUN_PUBLISH',
        pin_id: pin.pin_id,
        details: isLive
          ? `Successfully published to Pinterest live API. Board: ${pin.board_name}.`
          : `[DRY_RUN SIMULATION] Pin prepared safely (ENABLE_PUBLISH=${config.enable_publish}, DRY_RUN_MODE=${config.dry_run_mode}). No external API POST made.`,
        payload_snapshot: {
          board_id: config.pinterest_board_id || 'BOARD_PLACEHOLDER_123',
          title: pin.title,
          description: pin.description,
          link: pin.destination_url,
          media_source: { source_type: 'image_id', media_id: `media_${pin.perceptual_hash.slice(0, 8)}` }
        },
      };

      setAuditLogs(prev => [newLog, ...prev]);
      setTodayCount(prev => prev + 1);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }, 1000);
  };

  const handleQuickSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      if (candidates.length > 0) {
        handlePublishPin(candidates[0]);
      } else {
        setTodayCount(prev => Math.min(config.max_pins_per_day, prev + 1));
      }
    }, 1200);
  };

  const handleResetQuota = () => {
    setTodayCount(0);
  };

  const handleRecalculateAdaptation = () => {
    // Randomize slight performance variations to simulate incoming data
    setPerformance(prev => prev.map(p => {
      const delta = (Math.random() * 0.4 - 0.2);
      const newSave = Math.max(1.0, +(p.save_rate_pct + delta).toFixed(2));
      const newCtr = Math.max(0.5, +(p.outbound_ctr_pct + delta * 0.5).toFixed(2));
      const newScore = +(newSave * 2 + newCtr * 3).toFixed(2);
      return {
        ...p,
        save_rate_pct: newSave,
        outbound_ctr_pct: newCtr,
        engagement_score: newScore,
      };
    }));
    confetti({ particleCount: 30, spread: 40 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navbar & Safety Bar */}
      <Navbar
        config={config}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        todayCount={todayCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRunbook={() => setIsRunbookOpen(true)}
        onDownloadZip={downloadRepositoryZip}
        onQuickSimulate={handleQuickSimulate}
        isSimulating={isSimulating}
      />

      {/* Main Tab View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            config={config}
            todayCount={todayCount}
            auditLogs={auditLogs}
            performance={performance}
            onTriggerCycle={handleQuickSimulate}
            onResetQuota={handleResetQuota}
            isSimulating={isSimulating}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'research' && (
          <ResearchTab
            topics={topics}
            setTopics={setTopics}
            onGeneratePlan={handleGeneratePlan}
            plan={plan}
            topPerformingStyle={topPerformingStyle}
            onBatchAddCandidates={(newPins) => setCandidates(prev => [...newPins, ...prev])}
          />
        )}

        {activeTab === 'pinstudio' && (
          <PinStudioTab
            onSaveCandidate={handleSaveCandidate}
            brandName={config.brand_name}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyDedupeTab />
        )}

        {activeTab === 'publisher' && (
          <PublisherSimulatorTab
            candidates={candidates}
            config={config}
            todayCount={todayCount}
            onPublishPin={handlePublishPin}
            auditLogs={auditLogs}
            isPublishing={isPublishing}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            performance={performance}
            onRecalculateAdaptation={handleRecalculateAdaptation}
          />
        )}

        {activeTab === 'scheduler' && (
          <SchedulerWorkflowTab config={config} />
        )}

        {activeTab === 'repo' && (
          <RepoExplorerTab onDownloadZip={downloadRepositoryZip} />
        )}

        {activeTab === 'tests' && (
          <AcceptanceTestsTab />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-300 font-sans">Pinterest Auto Marketer</strong> • Zero-Cost Autonomous Marketing Engine (OSS Pillow + Unsplash + GitHub Actions)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunbookOpen(true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Operator Runbook
            </button>
            <span>•</span>
            <button
              onClick={downloadRepositoryZip}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Download Repo (.ZIP)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RunbookModal
        isOpen={isRunbookOpen}
        onClose={() => setIsRunbookOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleUpdateConfig}
      />
    </div>
  );
}
