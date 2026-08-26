"""
Pinterest Auto Marketer - Research & Strategy Module
Analyzes seed topics, generates keyword variations, determines optimal posting windows,
and formats the strategy into a runnable plan.json artifact.
Zero-cost: Uses free keyword heuristics, topic seeds, and Unsplash topic taxonomy.
"""

import json
import csv
import random
import os
from datetime import datetime, timezone

class ResearchEngine:
    def __init__(self, topics_csv_path="inputs/topics.csv", seeds_json_path="inputs/seeds.json"):
        self.topics_csv_path = topics_csv_path
        self.seeds_json_path = seeds_json_path
        self.trending_modifiers = [
            "Aesthetic Ideas for 2026",
            "Beginner's Step-by-Step Guide",
            "Simple Hacks You Need to Try",
            "Clean & Cozy Inspiration",
            "Essential Checklist & Tips",
            "How to Level Up Your Routine",
            "Budget-Friendly Solutions",
            "Minimalist Setup & Layout"
        ]
        self.hashtag_pool = {
            "home_decor": ["#scandihome", "#minimalisthome", "#homedecorideas", "#neutralaesthetic", "#cozydecor", "#interiorinsposhare"],
            "productivity": ["#productivityhacks", "#timeblocking", "#deepwork", "#dailyroutine", "#planneraddict", "#organizeyourlife"],
            "healthy_recipes": ["#mealprepideas", "#healthybowls", "#quickrecipes", "#mediterraneandiet", "#cleaneatingrecipes", "#highproteinmeals"],
            "remote_work": ["#wfhsetup", "#deskgoals", "#workfromhome", "#ergonomicworkspace", "#smallspacedecor", "#minimalistdesk"],
            "sustainable_living": ["#zerowasteliving", "#ecofriendlytips", "#sustainablehome", "#greenlifestyle", "#plasticfree", "#consciousliving"],
            "fitness": ["#pilatesworkout", "#coreworkout", "#gentlefitness", "#homeworkout", "#dailyhabit", "#mobilitytraining"],
            "digital_nomad": ["#digitalnomadlife", "#remoteworktravel", "#budgettraveltips", "#nomadfamily", "#workandtravel", "#locationindependent"]
        }

    def load_seeds(self):
        seeds = {}
        if os.path.exists(self.seeds_json_path):
            with open(self.seeds_json_path, "r", encoding="utf-8") as f:
                seeds = json.load(f)
        return seeds

    def load_topics(self):
        topics = []
        if os.path.exists(self.topics_csv_path):
            with open(self.topics_csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    topics.append(row)
        return topics

    def generate_plan(self, count=5, adjustments_path=None):
        """
        Generates research plan with pin configurations, optimal post hours with jitter,
        and high-converting hashtag clusters. Incorporates feedback from adjustments.json if available.
        """
        topics = self.load_topics()
        seeds = self.load_seeds()
        
        # Load feedback loop if adjustments exist
        adjustments = {}
        if adjustments_path and os.path.exists(adjustments_path):
            try:
                with open(adjustments_path, "r", encoding="utf-8") as f:
                    adjustments = json.load(f)
            except Exception:
                pass

        if not topics:
            topics = [{
                "category": "productivity",
                "topic_seed": "Daily Mindful Morning Routine",
                "keywords": "morning routine, mindfulness, healthy habits, productivity",
                "target_board": "Daily Habits",
                "destination_url": "https://example.com/morning-routine"
            }]

        selected_topics = random.sample(topics, min(count, len(topics))) if len(topics) >= count else topics
        plan_items = []
        
        preferred_hours = seeds.get("posting_schedule_preferences", {}).get("preferred_hours_utc", [14, 17, 21, 23])
        jitter_mins = seeds.get("posting_schedule_preferences", {}).get("jitter_window_minutes", 30)

        for i, t in enumerate(selected_topics):
            cat = t.get("category", "general")
            keywords_list = [k.strip() for k in t.get("keywords", "").split(",") if k.strip()]
            hashtags = self.hashtag_pool.get(cat, ["#pinterestfinds", "#inspo", "#aesthetic", "#lifestyle"])
            
            # Select 4-6 randomized hashtags
            chosen_tags = random.sample(hashtags, min(5, len(hashtags)))
            
            # Style preset selection - prioritize top performing style from adjustments if any
            recommended_style = adjustments.get("top_performing_template", "modern_minimalist")
            styles = seeds.get("visual_style_presets", ["modern_minimalist", "warm_editorial", "clean_infographic", "bold_quote"])
            style = recommended_style if (i % 2 == 0) else random.choice(styles)

            # Compute jittered target time
            base_hour = preferred_hours[i % len(preferred_hours)]
            jitter_offset = random.randint(-jitter_mins, jitter_mins)
            
            plan_items.append({
                "plan_id": f"plan_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{i+1:02d}",
                "category": cat,
                "topic_seed": t.get("topic_seed"),
                "headline_prompt": f"{t.get('topic_seed')} - {random.choice(self.trending_modifiers)}",
                "keywords": keywords_list,
                "hashtags": chosen_tags,
                "target_board": t.get("target_board", "General Inspiration"),
                "destination_url": t.get("destination_url", "https://example.com"),
                "visual_style": style,
                "scheduled_hour_utc": base_hour,
                "jitter_minutes": jitter_offset,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        output_plan = {
            "version": "1.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "items_count": len(plan_items),
            "adaptation_feedback_applied": bool(adjustments),
            "items": plan_items
        }

        os.makedirs("logs", exist_ok=True)
        with open("logs/plan.json", "w", encoding="utf-8") as f:
            json.dump(output_plan, f, indent=2)

        return output_plan

if __name__ == "__main__":
    engine = ResearchEngine()
    plan = engine.generate_plan(count=3)
    print(f"[ResearchEngine] Created plan with {plan['items_count']} pins -> saved to logs/plan.json")
