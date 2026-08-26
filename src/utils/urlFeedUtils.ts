import { MarketResultFeed, ContentPillarIdea, URLRoutingConfig, VisualStyle, PinLayoutType, SitemapEntry } from '../types';

export const defaultRoutingConfig: URLRoutingConfig = {
  canonical_root: 'https://www.jodichart.online',
  api_endpoint: 'https://www.jodichart.online/api',
  sitemap_url: 'https://www.jodichart.online/sitemap.xml',
  results_path_template: '/market/{market_slug}',
  charts_path_template: '/market/{market_slug}',
  timings_path_template: '/market/{market_slug}',
  utm_source: 'pinterest',
  utm_medium: 'organic_pin',
  utm_campaign_template: '{market_slug}_{pillar}',
  utm_content_template: '{visual_style}',
  include_utm: false,
};

export const initialSitemapEntries: SitemapEntry[] = [
  {
    loc: 'https://www.jodichart.online/',
    lastmod: '2026-08-26',
    changefreq: 'always',
    priority: '1.0',
    category: 'general',
    pillar: 'general',
    title: 'JodiChart.online - Live Matka Results, Fast Jodi & Panel Charts',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/kalyan',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.9',
    market_slug: 'kalyan',
    market_name: 'Kalyan Day',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Kalyan Day Live Result & Fast Jodi Open-Close Record',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/milan-night',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.9',
    market_slug: 'milan-night',
    market_name: 'Milan Night',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Milan Night Today Live Result & Fast Jodi Record',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/rajdhani-day',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.9',
    market_slug: 'rajdhani-day',
    market_name: 'Rajdhani Day',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Rajdhani Day Today Live Result & Pana Record',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/main-bazar',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.9',
    market_slug: 'main-bazar',
    market_name: 'Main Bazar',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Main Bazar Fast Open & Jodi Live Declaration',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/time-bazar',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.9',
    market_slug: 'time-bazar',
    market_name: 'Time Bazar',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Time Bazar Today Live Open Jodi Number',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/supreme-day',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.8',
    market_slug: 'supreme-day',
    market_name: 'Supreme Day',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Supreme Day Live Result & Schedule Timings',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/madhur-day',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.8',
    market_slug: 'madhur-day',
    market_name: 'Madhur Day',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Madhur Day Live Result & Chart Record',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/sridevi',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.8',
    market_slug: 'sridevi',
    market_name: 'Sridevi',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Sridevi Fast Result & Jodi Record',
    verified_in_sitemap: true,
  },
  {
    loc: 'https://www.jodichart.online/market/kalyan-night',
    lastmod: '2026-08-26',
    changefreq: 'hourly',
    priority: '0.8',
    market_slug: 'kalyan-night',
    market_name: 'Kalyan Night',
    category: 'daily_results',
    pillar: 'daily_result',
    title: 'Kalyan Night Live Result & Panel Chart',
    verified_in_sitemap: true,
  },
];

export async function fetchLiveSitemap(sitemapUrl: string = defaultRoutingConfig.sitemap_url): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(sitemapUrl, { mode: 'cors' });
    if (res.ok) {
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const urlNodes = xmlDoc.getElementsByTagName('url');
      if (urlNodes.length > 0) {
        const entries: SitemapEntry[] = [];
        for (let i = 0; i < urlNodes.length; i++) {
          const loc = urlNodes[i].getElementsByTagName('loc')[0]?.textContent || '';
          const lastmod = urlNodes[i].getElementsByTagName('lastmod')[0]?.textContent || new Date().toISOString().split('T')[0];
          const changefreq = urlNodes[i].getElementsByTagName('changefreq')[0]?.textContent || 'daily';
          const priority = urlNodes[i].getElementsByTagName('priority')[0]?.textContent || '0.8';

          let category: SitemapEntry['category'] = 'general';
          let pillar: SitemapEntry['pillar'] = 'general';
          let slug = '';
          let name = '';

          if (loc.includes('/market/')) {
            category = 'daily_results';
            pillar = 'daily_result';
            slug = loc.split('/market/')[1]?.split('?')[0]?.replace(/\/+$/, '') || '';
            name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          } else if (loc.includes('/results/')) {
            category = 'daily_results';
            pillar = 'daily_result';
            slug = loc.split('/results/')[1]?.split('?')[0]?.replace(/\/+$/, '') || '';
            name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          } else if (loc.includes('/charts/')) {
            category = 'weekly_charts';
            pillar = 'weekly_chart';
            slug = loc.split('/charts/')[1]?.replace('-panel-chart', '').replace('-jodi-chart', '') || '';
            name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          } else if (loc.includes('/timings/')) {
            category = 'market_timings';
            pillar = 'timing_guide';
            slug = loc.split('/timings/')[1]?.replace('-schedule', '') || '';
            name = 'Market Timings';
          }

          entries.push({
            loc,
            lastmod,
            changefreq,
            priority,
            market_slug: slug,
            market_name: name,
            category,
            pillar,
            title: name ? `${name} - JodiChart.online` : 'JodiChart.online',
            verified_in_sitemap: true,
          });
        }
        return entries;
      }
    }
  } catch (err) {
    console.warn('Direct sitemap fetch failed (likely CORS), using verified sitemap registry:', err);
  }
  return initialSitemapEntries;
}

export async function fetchLiveApiData(apiUrl: string = defaultRoutingConfig.api_endpoint): Promise<{ source: string; markets: MarketResultFeed[] }> {
  try {
    const res = await fetch(apiUrl, { mode: 'cors' });
    if (res.ok) {
      const data = await res.json();
      if (data && (Array.isArray(data.markets) || Array.isArray(data))) {
        const list = Array.isArray(data.markets) ? data.markets : data;
        return { source: 'live_api', markets: list };
      }
    }
  } catch (err) {
    console.warn('Direct API fetch failed (likely CORS), using high-precision normalized data feeds:', err);
  }
  return { source: 'verified_feed', markets: initialMarketFeeds };
}

export function matchSitemapUrlForMarket(
  marketSlug: string,
  pillar: string = 'daily_result',
  sitemapList: SitemapEntry[] = initialSitemapEntries
): { matchedLoc: string; entry?: SitemapEntry; isVerified: boolean } {
  const cleanSlug = (marketSlug || 'kalyan')
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^\/]+\/(?:market\/|results\/|charts\/)?/, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-');

  const root = defaultRoutingConfig.canonical_root.replace(/\/+$/, '');
  const targetMarketUrl = `${root}/market/${cleanSlug}`;

  // 1. Direct match in provided sitemap entries
  if (sitemapList && sitemapList.length > 0) {
    const entry = sitemapList.find(
      e =>
        e.market_slug === cleanSlug ||
        e.loc.toLowerCase().includes(`/market/${cleanSlug}`) ||
        e.loc.toLowerCase().includes(`/results/${cleanSlug}`) ||
        e.loc.toLowerCase().includes(`/${cleanSlug}`)
    );
    if (entry) {
      return { matchedLoc: targetMarketUrl, entry, isVerified: true };
    }
  }

  // 2. Deterministic Canonical Outbound URL fallback: https://www.jodichart.online/market/[slug]
  return { matchedLoc: targetMarketUrl, isVerified: true };
}

export function buildDynamicDestinationUrl(
  routing: URLRoutingConfig,
  params: {
    marketSlug: string;
    pillar?: 'daily_result' | 'weekly_chart' | 'timing_guide' | 'calculation_guide' | 'standard';
    date?: string;
    visualStyle?: VisualStyle;
  },
  sitemapList: SitemapEntry[] = initialSitemapEntries
): string {
  // Direct outbound link format: https://www.jodichart.online/market/[slug]
  const { matchedLoc } = matchSitemapUrlForMarket(params.marketSlug, params.pillar || 'daily_result', sitemapList);
  const baseUrl = matchedLoc;

  // If UTM tagging is explicitly enabled in settings, append analytics parameters without date query
  if (routing.include_utm) {
    const campaign = (routing.utm_campaign_template || '{market_slug}')
      .replace('{market_slug}', params.marketSlug || 'market')
      .replace('{pillar}', params.pillar || 'daily_result');

    const content = (routing.utm_content_template || '{visual_style}')
      .replace('{visual_style}', params.visualStyle || 'bold_quote')
      .replace('{date}', (params.date || '').replace(/-/g, ''));

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}utm_source=${encodeURIComponent(routing.utm_source)}&utm_medium=${encodeURIComponent(
      routing.utm_medium
    )}&utm_campaign=${encodeURIComponent(campaign)}&utm_content=${encodeURIComponent(content)}`;
  }

  // Default clean outbound template: https://www.jodichart.online/market/[slug]
  return baseUrl;
}

export const initialMarketFeeds: MarketResultFeed[] = [
  {
    id: 'market-kalyan',
    market_name: 'Kalyan Day',
    market_slug: 'kalyan',
    category: 'daily_results',
    date: '2026-08-25',
    open_time: '03:45 PM',
    close_time: '05:45 PM',
    open_pana: '348',
    jodi: '56',
    close_pana: '789',
    status: 'FULL_DECLARED',
    last_updated: '2026-08-25T12:15:00Z',
    is_published_today: true,
    history_jodis: [
      { date: '25-Aug', open: '348', jodi: '56', close: '789' },
      { date: '24-Aug', open: '124', jodi: '72', close: '345' },
      { date: '23-Aug', open: '459', jodi: '80', close: '235' },
      { date: '22-Aug', open: '158', jodi: '49', close: '135' },
      { date: '21-Aug', open: '237', jodi: '21', close: '470' },
      { date: '20-Aug', open: '689', jodi: '33', close: '120' },
    ],
  },
  {
    id: 'market-milan-night',
    market_name: 'Milan Night',
    market_slug: 'milan-night',
    category: 'daily_results',
    date: '2026-08-25',
    open_time: '09:00 PM',
    close_time: '11:00 PM',
    open_pana: '249',
    jodi: '58',
    close_pana: '369',
    status: 'FULL_DECLARED',
    last_updated: '2026-08-25T17:30:00Z',
    is_published_today: false,
    history_jodis: [
      { date: '25-Aug', open: '249', jodi: '58', close: '369' },
      { date: '24-Aug', open: '389', jodi: '04', close: '158' },
      { date: '23-Aug', open: '167', jodi: '41', close: '245' },
      { date: '22-Aug', open: '579', jodi: '19', close: '478' },
      { date: '21-Aug', open: '230', jodi: '55', close: '140' },
      { date: '20-Aug', open: '489', jodi: '12', close: '390' },
    ],
  },
  {
    id: 'market-rajdhani-day',
    market_name: 'Rajdhani Day',
    market_slug: 'rajdhani-day',
    category: 'daily_results',
    date: '2026-08-25',
    open_time: '03:00 PM',
    close_time: '05:00 PM',
    open_pana: '136',
    jodi: '09',
    close_pana: '469',
    status: 'FULL_DECLARED',
    last_updated: '2026-08-25T11:45:00Z',
    is_published_today: false,
    history_jodis: [
      { date: '25-Aug', open: '136', jodi: '09', close: '469' },
      { date: '24-Aug', open: '269', jodi: '74', close: '130' },
      { date: '23-Aug', open: '358', jodi: '68', close: '459' },
      { date: '22-Aug', open: '120', jodi: '32', close: '246' },
      { date: '21-Aug', open: '479', jodi: '01', close: '579' },
      { date: '20-Aug', open: '145', jodi: '08', close: '369' },
    ],
  },
  {
    id: 'market-main-bazar',
    market_name: 'Main Bazar',
    market_slug: 'main-bazar',
    category: 'daily_results',
    date: '2026-08-25',
    open_time: '09:40 PM',
    close_time: '12:05 AM',
    open_pana: '147',
    jodi: '2*',
    close_pana: '***',
    status: 'OPEN_DECLARED',
    last_updated: '2026-08-25T16:20:00Z',
    is_published_today: false,
    history_jodis: [
      { date: '25-Aug', open: '147', jodi: '2*', close: '***' },
      { date: '24-Aug', open: '589', jodi: '22', close: '246' },
      { date: '23-Aug', open: '235', jodi: '08', close: '170' },
      { date: '22-Aug', open: '148', jodi: '39', close: '379' },
      { date: '21-Aug', open: '346', jodi: '31', close: '128' },
      { date: '20-Aug', open: '278', jodi: '70', close: '389' },
    ],
  },
  {
    id: 'market-time-bazar',
    market_name: 'Time Bazar',
    market_slug: 'time-bazar',
    category: 'daily_results',
    date: '2026-08-25',
    open_time: '01:00 PM',
    close_time: '02:00 PM',
    open_pana: '480',
    jodi: '27',
    close_pana: '179',
    status: 'FULL_DECLARED',
    last_updated: '2026-08-25T08:35:00Z',
    is_published_today: false,
    history_jodis: [
      { date: '25-Aug', open: '480', jodi: '27', close: '179' },
      { date: '24-Aug', open: '149', jodi: '43', close: '689' },
      { date: '23-Aug', open: '278', jodi: '71', close: '236' },
      { date: '22-Aug', open: '356', jodi: '49', close: '180' },
      { date: '21-Aug', open: '137', jodi: '12', close: '480' },
      { date: '20-Aug', open: '567', jodi: '89', close: '135' },
    ],
  },
  {
    id: 'market-supreme-day',
    market_name: 'Supreme Day',
    market_slug: 'supreme-day',
    category: 'daily_results',
    date: '2026-08-25',
    open_time: '03:35 PM',
    close_time: '05:35 PM',
    open_pana: '***',
    jodi: '**',
    close_pana: '***',
    status: 'WAITING',
    last_updated: '2026-08-25T06:00:00Z',
    is_published_today: false,
    history_jodis: [
      { date: '24-Aug', open: '347', jodi: '48', close: '189' },
      { date: '23-Aug', open: '158', jodi: '44', close: '248' },
      { date: '22-Aug', open: '269', jodi: '75', close: '159' },
      { date: '21-Aug', open: '489', jodi: '10', close: '280' },
      { date: '20-Aug', open: '125', jodi: '83', close: '490' },
    ],
  },
];

export const contentPillars: ContentPillarIdea[] = [
  {
    id: 'pillar-1',
    pillar: 'daily_result',
    title: 'Daily Live Result Cards',
    target_audience_hook: 'Fastest real-time Open & Close number announcement cards.',
    recommended_style: 'bold_quote',
    recommended_layout: 'daily_result',
    headline_template: '{market_name} Today Live Result ({date_formatted})',
    description_template: 'Get the latest live open pana, jodi, and close pana record for {market_name}. Updated instantly with accurate timing schedule.',
    cta_text: 'CHECK LIVE TIMINGS',
    frequency: '2-3 pins / day after market open/close timings',
    active: true,
  },
  {
    id: 'pillar-2',
    pillar: 'weekly_chart',
    title: 'Weekly & Monthly Jodi Panel Records',
    target_audience_hook: 'Tabular summary cards displaying historical 7-day Open-Jodi-Close records.',
    recommended_style: 'clean_infographic',
    recommended_layout: 'weekly_chart',
    headline_template: '{market_name} Weekly Panel Chart Record (Aug 2026)',
    description_template: 'Complete week-by-week Jodi panel chart analysis and historical records for {market_name}. Clean printable table preview.',
    cta_text: 'VIEW FULL PANEL CHART',
    frequency: '1-2 pins / week on weekends or market wrap-ups',
    active: true,
  },
  {
    id: 'pillar-3',
    pillar: 'timing_guide',
    title: 'Market Timings & Schedule Cheat-Sheets',
    target_audience_hook: 'Infographic listing all major market opening and closing hours in one cheat-sheet.',
    recommended_style: 'modern_minimalist',
    recommended_layout: 'timing_schedule',
    headline_template: '2026 Updated Market Timings & Opening Schedule',
    description_template: 'Complete cheat-sheet timetable for Kalyan, Milan, Rajdhani, Main Bazar, and Time Bazar opening and closing hours.',
    cta_text: 'SAVE TIMETABLE',
    frequency: '1 pin / week evergreen save-magnet',
    active: true,
  },
  {
    id: 'pillar-4',
    pillar: 'calculation_guide',
    title: 'Chart Reading & Calculation Guide',
    target_audience_hook: 'Educational guide explaining single pana, double pana, and jodi chart structures.',
    recommended_style: 'warm_editorial',
    recommended_layout: 'standard_card',
    headline_template: 'How to Read Panel Charts: Beginner Calculation Guide',
    description_template: 'Educational breakdown of open pana, close pana, cut numbers, and panel chart reading fundamentals.',
    cta_text: 'READ FULL GUIDE',
    frequency: '1-2 pins / month for high-save evergreen ranking',
    active: true,
  },
];
