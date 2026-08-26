"""
Pinterest Auto Marketer - Deduplication & Policy Safety Engine
Strict anti-spam and policy compliance checks:
1. Image Perceptual Hash (Hamming distance threshold)
2. Text similarity (Levenshtein & Token Overlap)
3. Policy checks (banned words, sensitive categories, clickbait keywords)
4. Cross-board spam protection (prevents identical media across multiple boards on same day)
"""

import os
import json
import re
from datetime import datetime, timezone
import imagehash

class DedupeSafetyEngine:
    def __init__(self, registry_path="logs/hash_registry.json", max_hamming_distance=5, text_similarity_threshold=0.82):
        self.registry_path = registry_path
        self.max_hamming_distance = max_hamming_distance # Pins with hash distance < 5 are flagged as duplicates
        self.text_similarity_threshold = text_similarity_threshold
        
        # Banned keywords & strict Pinterest policy trigger terms
        self.banned_terms = [
            "get rich quick", "free money", "guaranteed income", "miracle cure",
            "lose 20 lbs in 3 days", "hack your bank", "crypto moon", "weight loss pill",
            "unlimited money", "work 10 minutes make $1000", "free gift card", "nsfw",
            "casino bonus", "adult dating", "forex signals", "instant riches"
        ]

    def load_registry(self):
        if os.path.exists(self.registry_path):
            try:
                with open(self.registry_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"images": [], "texts": [], "board_history": {}}

    def save_registry(self, registry):
        os.makedirs(os.path.dirname(self.registry_path) or ".", exist_ok=True)
        with open(self.registry_path, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2)

    def _levenshtein_ratio(self, s1, s2):
        """Zero-cost string similarity calculation."""
        s1, s2 = s1.lower().strip(), s2.lower().strip()
        if s1 == s2:
            return 1.0
        if not s1 or not s2:
            return 0.0

        # Token set jaccard overlap
        tokens1 = set(re.findall(r'\w+', s1))
        tokens2 = set(re.findall(r'\w+', s2))
        intersection = len(tokens1.intersection(tokens2))
        union = len(tokens1.union(tokens2))
        return intersection / float(union) if union > 0 else 0.0

    def check_policy(self, title, description):
        """
        Scans copy against policy restrictions and returns violation details if any.
        """
        combined = f"{title} {description}".lower()
        for banned in self.banned_terms:
            if banned in combined:
                return {
                    "passed": False,
                    "reason": f"Policy violation: Contains restricted keyword '{banned}'"
                }
        
        if len(title.strip()) < 5:
            return {"passed": False, "reason": "Title is too short (< 5 characters)"}
        
        return {"passed": True, "reason": "Policy checks passed"}

    def evaluate_pin_safety(self, pin_candidate):
        """
        Evaluates a candidate pin against image hashes, text similarity,
        content policy, and board cross-posting rules.
        """
        registry = self.load_registry()
        
        # 1. Policy check
        policy_result = self.check_policy(pin_candidate.get("title", ""), pin_candidate.get("description", ""))
        if not policy_result["passed"]:
            return {
                "safe_to_publish": False,
                "violation_type": "policy_filter",
                "details": policy_result["reason"]
            }

        candidate_phash = pin_candidate.get("perceptual_hash")
        candidate_title = pin_candidate.get("title", "")
        candidate_board = pin_candidate.get("board_name", "")
        today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # 2. Image Deduplication Check (Hamming distance)
        if candidate_phash:
            cand_hash_obj = imagehash.hex_to_hash(candidate_phash)
            for recorded in registry.get("images", []):
                rec_hash_str = recorded.get("phash")
                if rec_hash_str:
                    try:
                        rec_hash_obj = imagehash.hex_to_hash(rec_hash_str)
                        dist = cand_hash_obj - rec_hash_obj
                        if dist < self.max_hamming_distance:
                            return {
                                "safe_to_publish": False,
                                "violation_type": "image_duplicate",
                                "details": f"Near duplicate image detected (Hamming distance: {dist} < threshold {self.max_hamming_distance}). Recorded pin: {recorded.get('pin_id')}"
                            }
                    except Exception:
                        pass

        # 3. Text Deduplication Check
        for recorded in registry.get("texts", []):
            rec_title = recorded.get("title", "")
            sim = self._levenshtein_ratio(candidate_title, rec_title)
            if sim > self.text_similarity_threshold:
                return {
                    "safe_to_publish": False,
                    "violation_type": "text_duplicate",
                    "details": f"High text similarity detected ({int(sim*100)}% match with '{rec_title}'). Must be unique."
                }

        # 4. Cross-Board Daily Spam Protection
        # Ensure we don't post identical copy or seed to multiple boards on the same day
        today_posts = registry.get("board_history", {}).get(today_date, [])
        for entry in today_posts:
            if entry.get("topic_seed") == pin_candidate.get("topic_seed"):
                return {
                    "safe_to_publish": False,
                    "violation_type": "cross_board_frequency",
                    "details": f"Topic '{pin_candidate.get('topic_seed')}' was already scheduled today. Space across different days."
                }

        return {
            "safe_to_publish": True,
            "violation_type": None,
            "details": "Pin passed all deduplication and policy safety checks."
        }

    def register_published_pin(self, pin_metadata):
        """
        Records the approved pin into the persistent registry.
        """
        registry = self.load_registry()
        today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        if pin_metadata.get("perceptual_hash"):
            registry["images"].append({
                "pin_id": pin_metadata.get("pin_id"),
                "phash": pin_metadata.get("perceptual_hash"),
                "date": today_date
            })

        registry["texts"].append({
            "pin_id": pin_metadata.get("pin_id"),
            "title": pin_metadata.get("title"),
            "date": today_date
        })

        if today_date not in registry["board_history"]:
            registry["board_history"][today_date] = []

        registry["board_history"][today_date].append({
            "pin_id": pin_metadata.get("pin_id"),
            "board_name": pin_metadata.get("board_name"),
            "topic_seed": pin_metadata.get("topic_seed"),
            "published_at": datetime.now(timezone.utc).isoformat()
        })

        self.save_registry(registry)

if __name__ == "__main__":
    engine = DedupeSafetyEngine()
    dummy = {
        "pin_id": "test_001",
        "title": "Minimalist Scandi Living Room Ideas",
        "description": "Clean cozy living room tips",
        "perceptual_hash": "f0e0c08000000000",
        "board_name": "Living Room Inspo"
    }
    safety = engine.evaluate_pin_safety(dummy)
    print(f"[DedupeSafetyEngine] Result: {safety}")
