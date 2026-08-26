export type VisualStyle =
  | 'modern_minimalist'
  | 'warm_editorial'
  | 'clean_infographic'
  | 'bold_quote'
  | 'aesthetic_pastel';

export type PinLayoutType =
  | 'standard_card'
  | 'daily_result'
  | 'weekly_chart'
  | 'timing_schedule';

export interface MarketResultFeed {
  id: string;
  market_name: string;
  market_slug: string;
  category: string;
  date: string;
  open_time: string;
  close_time: string;
  open_pana: string;
  jodi: string;
  close_pana: string;
  status: 'OPEN_DECLARED' | 'FULL_DECLARED' | 'WAITING';
  last_updated: string;
  is_published_today?: boolean;
  history_jodis?: { date: string; open: string; jodi: string; close: string }[];
}

export interface ContentPillarIdea {
  id: string;
  pillar: 'daily_result' | 'weekly_chart' | 'timing_guide' | 'calculation_guide';
  title: string;
  target_audience_hook: string;
  recommended_style: VisualStyle;
  recommended_layout: PinLayoutType;
  headline_template: string;
  description_template: string;
  cta_text: string;
  frequency: string;
  active: boolean;
}

export interface URLRoutingConfig {
  canonical_root: string;
  api_endpoint: string;           // e.g. https://www.jodichart.online/api
  sitemap_url: string;            // e.g. https://www.jodichart.online/sitemap.xml
  results_path_template: string; // e.g. /results/{market_slug}?date={date}
  charts_path_template: string;  // e.g. /charts/{market_slug}-panel-chart
  timings_path_template: string; // e.g. /timings/{market_slug}-schedule
  utm_source: string;
  utm_medium: string;
  utm_campaign_template: string; // e.g. {market_slug}_{pillar}
  utm_content_template: string;  // e.g. {visual_style}_{date}
  include_utm: boolean;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq?: string;
  priority?: string;
  market_slug?: string;
  market_name?: string;
  pillar: 'daily_result' | 'weekly_chart' | 'timing_guide' | 'general';
  category: 'daily_results' | 'weekly_charts' | 'market_timings' | 'general';
  title: string;
  verified_in_sitemap: boolean;
}

export interface TopicSeed {
  id: string;
  category: string;
  topic_seed: string;
  keywords: string[];
  target_board: string;
  destination_url: string;
  matched_sitemap_loc?: string;
  sitemap_verified?: boolean;
  active: boolean;
}

export interface PinCandidate {
  pin_id: string;
  created_at: string;
  category: string;
  topic_seed: string;
  title: string;
  description: string;
  cta: string;
  board_name: string;
  destination_url: string;
  base_url: string;
  matched_sitemap_loc?: string;
  sitemap_verified?: boolean;
  sitemap_priority?: string;
  visual_style: VisualStyle;
  layout_type?: PinLayoutType;
  market_data?: {
    market_name: string;
    date: string;
    open_pana: string;
    jodi: string;
    close_pana: string;
    status: string;
    open_time: string;
    close_time: string;
  };
  image_path?: string;
  image_url?: string;
  dimensions: [number, number];
  perceptual_hash: string;
  average_hash: string;
  attribution: {
    source: string;
    photographer: string;
    photographer_url: string;
    download_location?: string;
  };
  keywords: string[];
  hashtags: string[];
  status: 'candidate' | 'simulated_published' | 'live_published' | 'rejected_dedupe' | 'throttled';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  status: 'SIMULATED_SUCCESS' | 'LIVE_SUCCESS' | 'REJECTED' | 'THROTTLED' | 'FAILED';
  action: string;
  pin_id: string;
  details: string;
  payload_snapshot?: Record<string, any>;
}

export interface StylePerformance {
  style: VisualStyle;
  name: string;
  impressions: number;
  pin_clicks: number;
  saves: number;
  outbound_clicks: number;
  save_rate_pct: number;
  outbound_ctr_pct: number;
  engagement_score: number;
}

export interface PlanItem {
  plan_id: string;
  category: string;
  topic_seed: string;
  headline_prompt: string;
  keywords: string[];
  hashtags: string[];
  target_board: string;
  destination_url: string;
  visual_style: VisualStyle;
  layout_type?: PinLayoutType;
  scheduled_hour_utc: number;
  jitter_minutes: number;
}

export interface AppConfig {
  enable_publish: boolean;
  dry_run_mode: boolean;
  max_pins_per_day: number;
  cron_runs_per_day: number;
  pinterest_access_token: string;
  pinterest_board_id: string;
  unsplash_access_key: string;
  huggingface_token: string;
  use_llm_copy: boolean;
  brand_name: string;
  brand_url: string;
  routing_config: URLRoutingConfig;
}
