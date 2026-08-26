import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Hash, 
  CheckCircle, 
  XCircle, 
  FileCheck
} from 'lucide-react';
import { calculateHammingDistance, calculateTextSimilarity, checkPolicyViolations, BANNED_POLICY_KEYWORDS } from '../utils/hashUtils';

export const SafetyDedupeTab: React.FC = () => {
  // Test 1: Image Perceptual Hash Comparator
  const [hash1, setHash1] = useState('e1f0c2394b88a910');
  const [hash2, setHash2] = useState('e1f0c2394b88a914'); // Distance = 2 -> Should fail
  const [hammingThreshold, setHammingThreshold] = useState(5);

  // Test 2: Text Similarity Comparator
  const [text1, setText1] = useState('10 Minimalist Scandinavian Living Room Ideas That Feel Cozy');
  const [text2, setText2] = useState('10 Minimalist Scandinavian Living Room Ideas That Feel Super Cozy');
  const [textThreshold, setTextThreshold] = useState(82);

  // Test 3: Policy Scanner
  const [policyInput, setPolicyInput] = useState('Discover easy cozy living room decor tips for beginners.');

  // Computations
  const computedHammingDist = calculateHammingDistance(hash1, hash2);
  const isImageDuplicate = computedHammingDist < hammingThreshold;

  const computedTextSim = Math.round(calculateTextSimilarity(text1, text2) * 100);
  const isTextDuplicate = computedTextSim > textThreshold;

  const policyResult = checkPolicyViolations(policyInput);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <span>🛡️</span> Safety, Deduplication & Policy Compliance Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero-cost verification algorithms in <code className="text-emerald-400 font-mono">dedupe_safety/dedupe_engine.py</code> preventing account spam and duplicate penalties.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Perceptual Hash Comparator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-400" />
                Image Perceptual Hash (pHash) Comparator
              </h3>
              <p className="text-xs text-slate-400">Uses 64-bit hexadecimal hashes to detect near-duplicate visual pins</p>
            </div>
            <span className="text-[11px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
              imagehash.phash
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium font-sans">Existing Registered Pin pHash</label>
              <input
                type="text"
                value={hash1}
                onChange={e => setHash1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium font-sans">Candidate Pin pHash</label>
              <input
                type="text"
                value={hash2}
                onChange={e => setHash2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Hamming Distance Gauge */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Computed Hamming Distance:</span>
              <span className="text-base font-bold text-white font-mono">{computedHammingDist} bits</span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isImageDuplicate ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (computedHammingDist / 20) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-[10px]">Threshold: Distance &lt; {hammingThreshold} is Duplicate</span>
              <span className="font-semibold">
                {isImageDuplicate ? (
                  <span className="text-rose-400 flex items-center gap-1 font-mono text-[10px]">
                    <XCircle className="w-3.5 h-3.5" /> REJECTED (Near-Duplicate Image)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                    <CheckCircle className="w-3.5 h-3.5" /> APPROVED (Unique Visual Image)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => { setHash1('e1f0c2394b88a910'); setHash2('e1f0c2394b88a914'); }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
            >
              Preset: Near Duplicate (Distance 2)
            </button>
            <button
              onClick={() => { setHash1('e1f0c2394b88a910'); setHash2('8a910c2394fe0011'); }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
            >
              Preset: Unique Image (Distance 14)
            </button>
          </div>
        </div>

        {/* Card 2: Text Similarity & Levenshtein Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Text Similarity & Token Overlap Analyzer
              </h3>
              <p className="text-xs text-slate-400">Prevents repetitive keyword stuffing and identical copy variations</p>
            </div>
            <span className="text-[11px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
              Jaccard & Overlap
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Text A (Recorded Title)</label>
              <input
                type="text"
                value={text1}
                onChange={e => setText1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Text B (Candidate Title)</label>
              <input
                type="text"
                value={text2}
                onChange={e => setText2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Similarity Gauge */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Token Overlap Similarity:</span>
              <span className="text-base font-bold text-white font-mono">{computedTextSim}%</span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isTextDuplicate ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${computedTextSim}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-[10px]">Threshold: Similarity &gt; {textThreshold}% is Duplicate</span>
              <span className="font-semibold">
                {isTextDuplicate ? (
                  <span className="text-rose-400 flex items-center gap-1 font-mono text-[10px]">
                    <XCircle className="w-3.5 h-3.5" /> REJECTED (Too Similar)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                    <CheckCircle className="w-3.5 h-3.5" /> APPROVED (Sufficiently Unique)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Content Policy Scanner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Pinterest Policy & Sensitive Categories Scanner
              </h3>
              <p className="text-xs text-slate-400">Scans titles and descriptions for restricted claims (e.g. false cures, clickbait, prohibited words)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-medium text-slate-400">
                Test Copy (Title or Description)
              </label>
              <textarea
                rows={3}
                value={policyInput}
                onChange={e => setPolicyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Enter copy to scan..."
              />

              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <button
                  onClick={() => setPolicyInput('Discover easy cozy living room decor tips for beginners.')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
                >
                  Example: Safe Copy
                </button>
                <button
                  onClick={() => setPolicyInput('Get rich quick with this miracle cure to lose 20 lbs in 3 days guaranteed.')}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[11px] cursor-pointer"
                >
                  Example: Policy Violation Trigger
                </button>
              </div>
            </div>

            {/* Scan Output */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              policyResult.passed
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100'
                : 'bg-rose-500/5 border-rose-500/20 text-rose-100'
            }`}>
              <div>
                <div className="flex items-center gap-2 font-semibold text-xs mb-1.5">
                  {policyResult.passed ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Policy Check: PASSED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Policy Check: VIOLATION DETECTED</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">
                  {policyResult.passed
                    ? 'No restricted keywords or prohibited claims detected. Safe for automated queue.'
                    : `Contains ${policyResult.violatedKeywords.length} prohibited term(s): ${policyResult.violatedKeywords.map(k => `"${k}"`).join(', ')}`}
                </p>
              </div>

              <div className="text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-800/80 font-mono">
                {BANNED_POLICY_KEYWORDS.length} policy rules monitored
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
