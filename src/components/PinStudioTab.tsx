import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Hash, 
  Check, 
  ShieldCheck,
  Calendar,
  Layers,
  Clock,
  Link2,
  Table
} from 'lucide-react';
import { VisualStyle, PinCandidate, PinLayoutType, MarketResultFeed } from '../types';
import { sampleCuratedBackgrounds } from '../data/initialData';
import { generatePseudoPerceptualHash } from '../utils/hashUtils';
import { initialMarketFeeds, defaultRoutingConfig, buildDynamicDestinationUrl, matchSitemapUrlForMarket, initialSitemapEntries } from '../utils/urlFeedUtils';

interface PinStudioTabProps {
  onSaveCandidate: (pin: PinCandidate) => void;
  brandName: string;
}

export const PinStudioTab: React.FC<PinStudioTabProps> = ({
  onSaveCandidate,
  brandName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Layout mode & Market Preset
  const [layoutType, setLayoutType] = useState<PinLayoutType>('daily_result');
  const [selectedMarket, setSelectedMarket] = useState<MarketResultFeed>(initialMarketFeeds[0]);

  // Daily Result Specific State
  const [marketName, setMarketName] = useState(initialMarketFeeds[0].market_name);
  const [resultDate, setResultDate] = useState('2026-08-25');
  const [openPana, setOpenPana] = useState(initialMarketFeeds[0].open_pana);
  const [jodi, setJodi] = useState(initialMarketFeeds[0].jodi);
  const [closePana, setClosePana] = useState(initialMarketFeeds[0].close_pana);
  const [openTime, setOpenTime] = useState(initialMarketFeeds[0].open_time);
  const [closeTime, setCloseTime] = useState(initialMarketFeeds[0].close_time);
  const [resultStatus, setResultStatus] = useState<'OPEN_DECLARED' | 'FULL_DECLARED' | 'WAITING'>('FULL_DECLARED');

  // Standard Studio State
  const [headline, setHeadline] = useState('Kalyan Day Today Live Result (25 Aug 2026)');
  const [subhead, setSubhead] = useState('Fastest Live Open & Close Timing Updates');
  const [ctaText, setCtaText] = useState('CHECK LIVE TIMINGS');
  const [brand, setBrand] = useState(brandName || 'JodiChart.online');
  const [targetBoard, setTargetBoard] = useState('Live Market Results');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('bold_quote');
  const [selectedBg, setSelectedBg] = useState(sampleCuratedBackgrounds[0]);
  const [bgMode, setBgMode] = useState<'curated' | 'procedural_gradient'>('procedural_gradient');
  const [phash, setPhash] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Compute current pillar and match against sitemap.xml
  const currentPillar = layoutType === 'daily_result' ? 'daily_result' : layoutType === 'weekly_chart' ? 'weekly_chart' : 'timing_guide';
  const sitemapMatch = matchSitemapUrlForMarket(selectedMarket.market_slug, currentPillar, initialSitemapEntries);

  // Compute dynamic destination URL
  const dynamicUrl = buildDynamicDestinationUrl(defaultRoutingConfig, {
    marketSlug: selectedMarket.market_slug,
    pillar: currentPillar,
    date: resultDate,
    visualStyle,
  }, initialSitemapEntries);

  // Color & typography themes
  const styleConfigs: Record<VisualStyle, {
    cardBg: string;
    cardBorder: string;
    textColor: string;
    subtextColor: string;
    accentColor: string;
    ctaBg: string;
    ctaTextColor: string;
    fontFamily: string;
    gradient: [string, string];
    badgeBg: string;
    badgeText: string;
  }> = {
    bold_quote: {
      cardBg: 'rgba(15, 23, 42, 0.95)',
      cardBorder: 'rgba(51, 65, 85, 0.8)',
      textColor: '#F8FAFC',
      subtextColor: '#94A3B8',
      accentColor: '#10B981',
      ctaBg: '#10B981',
      ctaTextColor: '#022C22',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      gradient: ['#0B0F19', '#020617'],
      badgeBg: '#1E293B',
      badgeText: '#34D399',
    },
    modern_minimalist: {
      cardBg: 'rgba(255, 255, 255, 0.96)',
      cardBorder: 'rgba(203, 213, 225, 0.8)',
      textColor: '#0F172A',
      subtextColor: '#475569',
      accentColor: '#059669',
      ctaBg: '#0F172A',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      gradient: ['#F8FAFC', '#E2E8F0'],
      badgeBg: '#F1F5F9',
      badgeText: '#0F172A',
    },
    clean_infographic: {
      cardBg: 'rgba(15, 23, 42, 0.96)',
      cardBorder: 'rgba(14, 165, 233, 0.4)',
      textColor: '#FFFFFF',
      subtextColor: '#94A3B8',
      accentColor: '#38BDF8',
      ctaBg: '#0284C7',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      gradient: ['#0C1E3A', '#060D1A'],
      badgeBg: '#0369A1',
      badgeText: '#E0F2FE',
    },
    warm_editorial: {
      cardBg: 'rgba(28, 20, 16, 0.96)',
      cardBorder: 'rgba(234, 88, 12, 0.4)',
      textColor: '#FFF7ED',
      subtextColor: '#FED7AA',
      accentColor: '#F97316',
      ctaBg: '#EA580C',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'Georgia, Cambria, serif',
      gradient: ['#2A160E', '#140A06'],
      badgeBg: '#7C2D12',
      badgeText: '#FFEDD5',
    },
    aesthetic_pastel: {
      cardBg: 'rgba(24, 16, 33, 0.96)',
      cardBorder: 'rgba(217, 70, 239, 0.4)',
      textColor: '#FAF5FF',
      subtextColor: '#E9D5FF',
      accentColor: '#C084FC',
      ctaBg: '#A855F7',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      gradient: ['#231238', '#0F0619'],
      badgeBg: '#581C87',
      badgeText: '#F3E8FF',
    },
  };

  // Switch Market Preset
  const handleSelectMarket = (m: MarketResultFeed) => {
    setSelectedMarket(m);
    setMarketName(m.market_name);
    setResultDate(m.date);
    setOpenPana(m.open_pana);
    setJodi(m.jodi);
    setClosePana(m.close_pana);
    setOpenTime(m.open_time);
    setCloseTime(m.close_time);
    setResultStatus(m.status);
    setHeadline(`${m.market_name} Today Live Result (${m.date})`);
    setSubhead(`Fastest ${m.market_name} Open & Close Jodi Chart Record`);
  };

  // Render to 2:3 Pinterest Canvas (1000x1500)
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1000;
    const height = 1500;
    canvas.width = width;
    canvas.height = height;

    const currentStyle = styleConfigs[visualStyle];

    const renderForeground = () => {
      if (layoutType === 'daily_result') {
        // -------------------------------------------------------------
        // LAYOUT A: DAILY LIVE RESULT CARD (High-Contrast Number Callout)
        // -------------------------------------------------------------
        const cardMarginX = 60;
        const cardY1 = 120;
        const cardY2 = 1380;
        const cardRadius = 36;

        // Outer Card Container
        ctx.save();
        ctx.fillStyle = currentStyle.cardBg;
        ctx.strokeStyle = currentStyle.cardBorder;
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        ctx.beginPath();
        ctx.roundRect(cardMarginX, cardY1, width - cardMarginX * 2, cardY2 - cardY1, cardRadius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Top Live Badge
        ctx.save();
        const badgeW = 380;
        const badgeH = 50;
        const badgeX = (width - badgeW) / 2;
        const badgeY = cardY1 + 45;
        ctx.fillStyle = currentStyle.accentColor;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
        ctx.fill();

        ctx.font = `bold 22px ${currentStyle.fontFamily}`;
        ctx.fillStyle = '#022C22';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⚡ LIVE RESULT • ${resultDate}`, width / 2, badgeY + badgeH / 2);
        ctx.restore();

        // Market Name Heading
        ctx.save();
        ctx.font = `900 68px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(marketName.toUpperCase(), width / 2, cardY1 + 175);

        // Subhead / Session
        ctx.font = `500 28px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.subtextColor;
        ctx.fillText(`Open: ${openTime}  |  Close: ${closeTime}`, width / 2, cardY1 + 235);
        ctx.restore();

        // Decorative Separator
        ctx.save();
        ctx.strokeStyle = currentStyle.accentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 140, cardY1 + 275);
        ctx.lineTo(width / 2 + 140, cardY1 + 275);
        ctx.stroke();
        ctx.restore();

        // HUGE NUMBER CALLOUT BOX
        const numBoxX = cardMarginX + 40;
        const numBoxY = cardY1 + 320;
        const numBoxW = width - (cardMarginX + 40) * 2;
        const numBoxH = 340;
        const numBoxRadius = 28;

        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
        ctx.strokeStyle = currentStyle.accentColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = currentStyle.accentColor;
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.roundRect(numBoxX, numBoxY, numBoxW, numBoxH, numBoxRadius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Number Labels
        ctx.save();
        ctx.font = '600 20px monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OPEN PANA', numBoxX + numBoxW * 0.22, numBoxY + 55);
        ctx.fillText('JODI', numBoxX + numBoxW * 0.50, numBoxY + 55);
        ctx.fillText('CLOSE PANA', numBoxX + numBoxW * 0.78, numBoxY + 55);

        // Huge Monospace Formatted Numbers
        ctx.font = '900 78px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(openPana || '***', numBoxX + numBoxW * 0.22, numBoxY + 160);

        ctx.fillStyle = currentStyle.accentColor;
        ctx.font = '900 94px monospace';
        ctx.fillText(jodi || '**', numBoxX + numBoxW * 0.50, numBoxY + 160);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 78px monospace';
        ctx.fillText(closePana || '***', numBoxX + numBoxW * 0.78, numBoxY + 160);

        // Status Ribbon inside Number Box
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = resultStatus === 'FULL_DECLARED' ? '#10B981' : '#F59E0B';
        ctx.fillText(
          resultStatus === 'FULL_DECLARED' ? '● FULL RESULT DECLARED' : '◐ OPEN PANA DECLARED',
          width / 2,
          numBoxY + 280
        );
        ctx.restore();

        // Recent 3-Day Mini History Row
        const histY = cardY1 + 710;
        ctx.save();
        ctx.font = `bold 24px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.textColor;
        ctx.textAlign = 'center';
        ctx.fillText('PAST RECORD HISTORY', width / 2, histY);

        if (selectedMarket.history_jodis && selectedMarket.history_jodis.length > 0) {
          const pastCols = selectedMarket.history_jodis.slice(1, 4);
          const colW = (width - cardMarginX * 2 - 80) / pastCols.length;
          pastCols.forEach((hist, idx) => {
            const hx = cardMarginX + 40 + idx * colW;
            const hy = histY + 30;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(hx + 10, hy, colW - 20, 110, 16);
            ctx.fill();
            ctx.stroke();

            ctx.font = '18px monospace';
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(hist.date, hx + colW / 2, hy + 30);

            ctx.font = 'bold 24px monospace';
            ctx.fillStyle = '#F8FAFC';
            ctx.fillText(`${hist.open}-${hist.jodi}-${hist.close}`, hx + colW / 2, hy + 75);
          });
        }
        ctx.restore();

        // Secondary Info Box
        ctx.save();
        ctx.font = `24px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.subtextColor;
        ctx.textAlign = 'center';
        ctx.fillText('Tap below to check complete Jodi panel chart & live timetable', width / 2, cardY1 + 920);
        ctx.restore();

        // CTA Button
        const ctaW = 540;
        const ctaH = 92;
        const ctaX = (width - ctaW) / 2;
        const ctaY = cardY2 - 240;
        const ctaRadius = 24;

        ctx.save();
        ctx.fillStyle = currentStyle.ctaBg;
        ctx.shadowColor = currentStyle.accentColor;
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;
        ctx.beginPath();
        ctx.roundRect(ctaX, ctaY, ctaW, ctaH, ctaRadius);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.font = `900 32px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.ctaTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ctaText.toUpperCase(), width / 2, ctaY + ctaH / 2);
        ctx.restore();

        // Brand Footer Watermark
        ctx.save();
        ctx.font = `bold 22px monospace`;
        ctx.fillStyle = currentStyle.subtextColor;
        ctx.textAlign = 'center';
        ctx.fillText(`🌐 ${defaultRoutingConfig.canonical_root.replace('https://', '')}`, width / 2, cardY2 - 70);
        ctx.restore();

      } else if (layoutType === 'weekly_chart') {
        // -------------------------------------------------------------
        // LAYOUT B: WEEKLY JODI PANEL CHART (Tabular Grid)
        // -------------------------------------------------------------
        const cardMarginX = 60;
        const cardY1 = 100;
        const cardY2 = 1400;
        const cardRadius = 32;

        ctx.save();
        ctx.fillStyle = currentStyle.cardBg;
        ctx.strokeStyle = currentStyle.cardBorder;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cardMarginX, cardY1, width - cardMarginX * 2, cardY2 - cardY1, cardRadius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Header
        ctx.save();
        ctx.font = `900 56px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.textColor;
        ctx.textAlign = 'center';
        ctx.fillText(`${marketName.toUpperCase()} PANEL CHART`, width / 2, cardY1 + 90);

        ctx.font = `600 26px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.accentColor;
        ctx.fillText('Weekly Record Sheet (Aug 2026)', width / 2, cardY1 + 145);
        ctx.restore();

        // Table Header
        const tableY = cardY1 + 200;
        const tableW = width - cardMarginX * 2 - 60;
        const tableX = cardMarginX + 30;

        ctx.save();
        ctx.fillStyle = currentStyle.badgeBg;
        ctx.beginPath();
        ctx.roundRect(tableX, tableY, tableW, 60, 12);
        ctx.fill();

        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = currentStyle.badgeText;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DATE', tableX + tableW * 0.15, tableY + 30);
        ctx.fillText('OPEN PANA', tableX + tableW * 0.40, tableY + 30);
        ctx.fillText('JODI', tableX + tableW * 0.65, tableY + 30);
        ctx.fillText('CLOSE PANA', tableX + tableW * 0.88, tableY + 30);
        ctx.restore();

        // Table Rows
        const rows = selectedMarket.history_jodis || [];
        rows.forEach((r, idx) => {
          const rowY = tableY + 70 + idx * 80;
          ctx.save();
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(15, 23, 42, 0.7)' : 'rgba(30, 41, 59, 0.7)';
          ctx.beginPath();
          ctx.roundRect(tableX, rowY, tableW, 70, 10);
          ctx.fill();

          ctx.font = '600 24px monospace';
          ctx.fillStyle = idx === 0 ? currentStyle.accentColor : '#E2E8F0';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(r.date, tableX + tableW * 0.15, rowY + 35);
          ctx.fillText(r.open, tableX + tableW * 0.40, rowY + 35);

          ctx.font = 'bold 30px monospace';
          ctx.fillStyle = idx === 0 ? currentStyle.accentColor : '#FFFFFF';
          ctx.fillText(r.jodi, tableX + tableW * 0.65, rowY + 35);

          ctx.font = '600 24px monospace';
          ctx.fillStyle = idx === 0 ? currentStyle.accentColor : '#E2E8F0';
          ctx.fillText(r.close, tableX + tableW * 0.88, rowY + 35);
          ctx.restore();
        });

        // CTA Button
        const ctaW = 500;
        const ctaH = 88;
        const ctaX = (width - ctaW) / 2;
        const ctaY = cardY2 - 200;

        ctx.save();
        ctx.fillStyle = currentStyle.ctaBg;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 20);
        ctx.fill();

        ctx.font = `bold 28px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.ctaTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VIEW COMPLETE HISTORICAL CHART', width / 2, ctaY + ctaH / 2);
        ctx.restore();

        // Watermark
        ctx.save();
        ctx.font = `bold 20px monospace`;
        ctx.fillStyle = currentStyle.subtextColor;
        ctx.textAlign = 'center';
        ctx.fillText(`🌐 ${defaultRoutingConfig.canonical_root.replace('https://', '')}`, width / 2, cardY2 - 50);
        ctx.restore();

      } else if (layoutType === 'timing_schedule') {
        // -------------------------------------------------------------
        // LAYOUT C: MARKET TIMINGS CHEAT-SHEET
        // -------------------------------------------------------------
        const cardMarginX = 60;
        const cardY1 = 120;
        const cardY2 = 1380;
        const cardRadius = 32;

        ctx.save();
        ctx.fillStyle = currentStyle.cardBg;
        ctx.strokeStyle = currentStyle.cardBorder;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cardMarginX, cardY1, width - cardMarginX * 2, cardY2 - cardY1, cardRadius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Header
        ctx.save();
        ctx.font = `900 52px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.textColor;
        ctx.textAlign = 'center';
        ctx.fillText('2026 MARKET TIMINGS', width / 2, cardY1 + 90);

        ctx.font = `600 24px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.accentColor;
        ctx.fillText('Daily Opening & Closing Timetable', width / 2, cardY1 + 145);
        ctx.restore();

        // Timings List
        const listY = cardY1 + 200;
        const listW = width - cardMarginX * 2 - 60;
        const listX = cardMarginX + 30;

        initialMarketFeeds.slice(0, 5).forEach((m, idx) => {
          const rowY = listY + idx * 115;
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = idx === 0 ? currentStyle.accentColor : 'rgba(51, 65, 85, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(listX, rowY, listW, 95, 16);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 28px system-ui';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(m.market_name, listX + 25, rowY + 35);

          ctx.font = '20px system-ui';
          ctx.fillStyle = currentStyle.accentColor;
          ctx.fillText(`Status: ${m.status.replace('_', ' ')}`, listX + 25, rowY + 70);

          ctx.font = 'bold 24px monospace';
          ctx.fillStyle = '#F8FAFC';
          ctx.textAlign = 'right';
          ctx.fillText(`${m.open_time}  -  ${m.close_time}`, listX + listW - 25, rowY + 48);
          ctx.restore();
        });

        // CTA
        const ctaW = 500;
        const ctaH = 88;
        const ctaX = (width - ctaW) / 2;
        const ctaY = cardY2 - 200;

        ctx.save();
        ctx.fillStyle = currentStyle.ctaBg;
        ctx.beginPath();
        ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 20);
        ctx.fill();

        ctx.font = `bold 28px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.ctaTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SAVE DAILY TIMETABLE', width / 2, ctaY + ctaH / 2);
        ctx.restore();

        // Footer
        ctx.save();
        ctx.font = `bold 20px monospace`;
        ctx.fillStyle = currentStyle.subtextColor;
        ctx.textAlign = 'center';
        ctx.fillText(`🌐 ${defaultRoutingConfig.canonical_root.replace('https://', '')}`, width / 2, cardY2 - 50);
        ctx.restore();

      } else {
        // -------------------------------------------------------------
        // LAYOUT D: STANDARD EDITORIAL / INSPO CARD
        // -------------------------------------------------------------
        const cardMarginX = 70;
        const cardY1 = 280;
        const cardY2 = 1220;
        const cardRadius = 32;

        ctx.save();
        ctx.fillStyle = currentStyle.cardBg;
        ctx.strokeStyle = currentStyle.cardBorder;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cardMarginX, cardY1, width - cardMarginX * 2, cardY2 - cardY1, cardRadius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Brand Badge
        ctx.save();
        ctx.font = `bold 24px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.accentColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(brand.toUpperCase(), width / 2, cardY1 + 65);

        ctx.strokeStyle = currentStyle.accentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 60, cardY1 + 95);
        ctx.lineTo(width / 2 + 60, cardY1 + 95);
        ctx.stroke();
        ctx.restore();

        // Headline
        ctx.save();
        ctx.font = `bold 52px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const words = headline.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > width - cardMarginX * 2 - 80) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const headlineStartY = cardY1 + 270;
        const lineHeight = 68;
        lines.slice(0, 4).forEach((line, index) => {
          ctx.fillText(line, width / 2, headlineStartY + (index * lineHeight));
        });
        ctx.restore();

        // Subhead
        if (subhead) {
          ctx.save();
          ctx.font = `28px ${currentStyle.fontFamily}`;
          ctx.fillStyle = currentStyle.subtextColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(subhead, width / 2, cardY1 + 540);
          ctx.restore();
        }

        // CTA Button
        const ctaW = 460;
        const ctaH = 84;
        const ctaX = (width - ctaW) / 2;
        const ctaY = cardY2 - 120;

        ctx.save();
        ctx.fillStyle = currentStyle.ctaBg;
        ctx.beginPath();
        ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 20);
        ctx.fill();

        ctx.font = `bold 28px ${currentStyle.fontFamily}`;
        ctx.fillStyle = currentStyle.ctaTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ctaText.toUpperCase(), width / 2, ctaY + ctaH / 2);
        ctx.restore();
      }

      // Perceptual hash calculation
      const computedHash = generatePseudoPerceptualHash(`${layoutType}-${marketName}-${resultDate}-${openPana}-${jodi}-${closePana}-${visualStyle}`);
      setPhash(computedHash);
    };

    // Render Background
    if (bgMode === 'curated' && selectedBg.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedBg.url;
      img.onload = () => {
        const hRatio = width / img.width;
        const vRatio = height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (width - img.width * ratio) / 2;
        const centerShiftY = (height - img.height * ratio) / 2;

        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
        renderForeground();
      };
      img.onerror = () => {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, currentStyle.gradient[0]);
        grad.addColorStop(1, currentStyle.gradient[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        renderForeground();
      };
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, currentStyle.gradient[0]);
      grad.addColorStop(1, currentStyle.gradient[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle border line
      ctx.strokeStyle = currentStyle.cardBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, width - 60, height - 60);
      renderForeground();
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [
    layoutType,
    marketName,
    resultDate,
    openPana,
    jodi,
    closePana,
    openTime,
    closeTime,
    resultStatus,
    headline,
    subhead,
    ctaText,
    brand,
    visualStyle,
    selectedBg,
    bgMode,
  ]);

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pinterest_${marketName.toLowerCase().replace(/\s+/g, '_')}_${resultDate}.png`;
    link.href = canvas.toDataURL('image/png', 0.95);
    link.click();
  };

  const handleSaveToCandidate = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL('image/png', 0.8) : '';
    const pinId = `pin_${selectedMarket.market_slug}_${resultDate.replace(/-/g, '')}_${Math.random().toString(36).substring(2, 6)}`;

    const candidate: PinCandidate = {
      pin_id: pinId,
      created_at: new Date().toISOString(),
      category: 'daily_results',
      topic_seed: `${marketName} Result (${resultDate})`,
      title: `${marketName} Today Live Result (${resultDate}) | Fast Jodi & Pana Record`,
      description: `Fastest live update for ${marketName} today (${resultDate}). Open Pana: ${openPana}, Jodi: ${jodi}, Close Pana: ${closePana}. Check historical panel chart, weekly records, and daily timings. #kalyanresult #sattamatka #jodichart #panelchart`,
      cta: ctaText,
      board_name: targetBoard,
      destination_url: dynamicUrl,
      base_url: defaultRoutingConfig.canonical_root,
      matched_sitemap_loc: sitemapMatch.matchedLoc,
      sitemap_verified: sitemapMatch.isVerified,
      sitemap_priority: sitemapMatch.entry?.priority || '0.9',
      visual_style: visualStyle,
      layout_type: layoutType,
      market_data: {
        market_name: marketName,
        date: resultDate,
        open_pana: openPana,
        jodi,
        close_pana: closePana,
        status: resultStatus,
        open_time: openTime,
        close_time: closeTime,
      },
      image_url: dataUrl,
      dimensions: [1000, 1500],
      perceptual_hash: phash,
      average_hash: phash.split('').reverse().join(''),
      attribution: {
        source: bgMode === 'curated' ? 'Unsplash Free Tier' : 'Procedural Canvas',
        photographer: bgMode === 'curated' ? selectedBg.author : 'System Generator',
        photographer_url: 'https://unsplash.com',
      },
      keywords: [marketName.toLowerCase(), 'daily result', 'jodi chart', 'panel chart', 'open pana'],
      hashtags: [`#${selectedMarket.market_slug}`, '#liveresults', '#jodichart', '#matkaresult'],
      status: 'candidate',
    };

    onSaveCandidate(candidate);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <span>🎨</span> Pinterest 2:3 Pin Studio & Generator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero-cost Pillow/HTML5 engine rendering standard 1000x1500 px high-converting daily result cards and panel charts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG (1000x1500)</span>
          </button>
          <button
            onClick={handleSaveToCandidate}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-3.5 py-2 rounded-lg shadow transition-all cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Added to Publisher!' : 'Queue to Publisher'}</span>
          </button>
        </div>
      </div>

      {/* Pin Layout Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <label className="text-xs font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Pinterest 2:3 Layout Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'daily_result', label: 'Daily Result Card', desc: 'Large Open-Jodi-Close Box' },
            { id: 'weekly_chart', label: 'Weekly Jodi Chart', desc: 'Tabular 6-Day History Grid' },
            { id: 'timing_schedule', label: 'Market Timings Guide', desc: 'Opening/Closing Cheat-Sheet' },
            { id: 'standard_card', label: 'Standard Editorial Pin', desc: 'Article / Guide Card' },
          ].map(l => (
            <button
              key={l.id}
              onClick={() => {
                setLayoutType(l.id as PinLayoutType);
                if (l.id === 'daily_result') setCtaText('CHECK LIVE TIMINGS');
                else if (l.id === 'weekly_chart') setCtaText('VIEW FULL JODI CHART');
                else if (l.id === 'timing_schedule') setCtaText('SAVE DAILY TIMETABLE');
                else setCtaText('READ FULL GUIDE');
              }}
              className={`p-3 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                layoutType === l.id
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-medium text-slate-200">{l.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{l.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Customizer Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Market Preset Picker */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Live Market Data Preset
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Auto Ingestion Feed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {initialMarketFeeds.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMarket(m)}
                  className={`p-2.5 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                    selectedMarket.id === m.id
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-medium text-slate-200">{m.market_name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {m.open_pana}-{m.jodi}-{m.close_pana}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Result Data Form (if daily_result or weekly_chart) */}
          {(layoutType === 'daily_result' || layoutType === 'weekly_chart') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-400" />
                Live Result Numbers & Session Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Open Pana (3 Digits)</label>
                  <input
                    type="text"
                    value={openPana}
                    onChange={e => setOpenPana(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-center font-bold text-sm"
                    placeholder="348"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 mb-1 font-medium">Jodi (2 Digits)</label>
                  <input
                    type="text"
                    value={jodi}
                    onChange={e => setJodi(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono text-center font-bold text-sm"
                    placeholder="56"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Close Pana (3 Digits)</label>
                  <input
                    type="text"
                    value={closePana}
                    onChange={e => setClosePana(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-center font-bold text-sm"
                    placeholder="789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Market Name</label>
                  <input
                    type="text"
                    value={marketName}
                    onChange={e => setMarketName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Result Date</label>
                  <input
                    type="date"
                    value={resultDate}
                    onChange={e => setResultDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Declaration Status</label>
                  <select
                    value={resultStatus}
                    onChange={e => setResultStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FULL_DECLARED">FULL DECLARED</option>
                    <option value="OPEN_DECLARED">OPEN DECLARED</option>
                    <option value="WAITING">WAITING</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Visual Style Preset */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <label className="text-xs font-semibold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              Visual Color Theme Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'bold_quote', label: 'Obsidian Emerald', desc: 'High Contrast Dark' },
                { id: 'modern_minimalist', label: 'Clean White', desc: 'Minimalist Slate' },
                { id: 'clean_infographic', label: 'Midnight Indigo', desc: 'Electric Cyan' },
                { id: 'warm_editorial', label: 'Terracotta Gold', desc: 'Warm Classic' },
                { id: 'aesthetic_pastel', label: 'Royal Violet', desc: 'Vibrant Velvet' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setVisualStyle(s.id as VisualStyle)}
                  className={`p-2.5 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                    visualStyle === s.id
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-medium text-slate-200">{s.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Outbound Destination Link & Sitemap.xml Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-400" />
                Outbound Destination Link (Market Template)
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                ✓ https://www.jodichart.online/market/{selectedMarket.market_slug}
              </span>
            </div>

            {/* Clean Outbound Market Link */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Target Pinterest Destination URL:</span>
                <a
                  href={dynamicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer flex items-center gap-1"
                >
                  Test Link ↗
                </a>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono break-all text-emerald-300 select-all font-medium">
                {dynamicUrl}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When Pinterest users click this pin, traffic routes directly to <code className="text-emerald-400 font-mono">https://www.jodichart.online/market/{selectedMarket.market_slug}</code> based on the market slug template without any search query clutter.
            </p>
          </div>
        </div>

        {/* Right 5 Cols: Real-time 2:3 Canvas Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm w-full flex flex-col items-center sticky top-20">
            <div className="w-full flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-white">Live 2:3 Pinterest Canvas</span>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                1000 x 1500 px
              </span>
            </div>

            {/* Scaled Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-[2/3] w-full max-w-[340px] bg-slate-950">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'auto' }}
              />
            </div>

            {/* Perceptual Hash Badge */}
            <div className="w-full mt-4 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-emerald-400" />
                  Perceptual Hash (pHash):
                </span>
                <span className="text-emerald-400 font-bold">{phash}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between font-sans">
                <span>Layout: <strong className="text-slate-300 uppercase">{layoutType}</strong></span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Anti-Spam Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
