/**
 * Deduplication & Perceptual Hashing Utilities
 * Simulates 64-bit hexadecimal perceptual hashes (pHash) and calculates Hamming distance
 * and Levenshtein token overlap for text deduplication.
 */

export function calculateHammingDistance(hexHash1: string, hexHash2: string): number {
  if (!hexHash1 || !hexHash2) return 64;
  
  // Pad strings to same length
  const h1 = hexHash1.padEnd(16, '0').slice(0, 16);
  const h2 = hexHash2.padEnd(16, '0').slice(0, 16);
  
  let distance = 0;
  for (let i = 0; i < 16; i++) {
    const val1 = parseInt(h1[i], 16) || 0;
    const val2 = parseInt(h2[i], 16) || 0;
    let xor = val1 ^ val2;
    // count set bits
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

export function generatePseudoPerceptualHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = ((Math.abs(hash) * 9301 + 49297) % 233280).toString(16).padStart(8, '0');
  return (hex + salt).slice(0, 16);
}

export function calculateTextSimilarity(text1: string, text2: string): number {
  const clean1 = text1.toLowerCase().replace(/[^\w\s]/g, '');
  const clean2 = text2.toLowerCase().replace(/[^\w\s]/g, '');
  
  if (clean1 === clean2) return 1.0;
  if (!clean1 || !clean2) return 0.0;

  const tokens1 = new Set(clean1.split(/\s+/).filter(Boolean));
  const tokens2 = new Set(clean2.split(/\s+/).filter(Boolean));

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

export const BANNED_POLICY_KEYWORDS = [
  'get rich quick',
  'free money',
  'guaranteed income',
  'miracle cure',
  'lose 20 lbs in 3 days',
  'hack your bank',
  'crypto moon',
  'weight loss pill',
  'unlimited money',
  'work 10 minutes make $1000',
  'free gift card',
  'nsfw',
  'casino bonus',
  'adult dating',
  'forex signals',
  'instant riches',
];

export function checkPolicyViolations(text: string): { passed: boolean; violatedKeywords: string[] } {
  const lower = text.toLowerCase();
  const violated = BANNED_POLICY_KEYWORDS.filter(k => lower.includes(k));
  return {
    passed: violated.length === 0,
    violatedKeywords: violated,
  };
}

export function buildTrackedUrl(baseUrl: string, campaign: string, pinId: string): string {
  try {
    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
    url.searchParams.set('utm_source', 'pinterest');
    url.searchParams.set('utm_medium', 'organic_pin');
    url.searchParams.set('utm_campaign', campaign);
    url.searchParams.set('utm_content', pinId);
    return url.toString();
  } catch (e) {
    return `${baseUrl}?utm_source=pinterest&utm_medium=organic_pin&utm_campaign=${campaign}&utm_content=${pinId}`;
  }
}
