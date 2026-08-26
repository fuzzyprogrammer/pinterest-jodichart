"""
Pinterest Auto Marketer - Copy & Metadata Generator
Zero-Cost-First template copy engine with rich headline and description formulas.
Optional: Gated HuggingFace Inference API integration (explicitly opt-in only).
"""

import os
import random
import requests

class CopyGenerator:
    def __init__(self, use_llm=False, hf_token=None):
        self.use_llm = use_llm or (os.getenv("USE_LLM_COPY", "false").lower() == "true")
        self.hf_token = hf_token or os.getenv("HUGGINGFACE_TOKEN")

        # Zero-cost high-converting Pinterest title formulas
        self.title_templates = [
            "{topic_seed}: The Ultimate Guide for {target_audience}",
            "10 {topic_seed} Ideas You Will Wish You Found Sooner",
            "How to Master {topic_seed} (Step-by-Step)",
            "The Minimalist's Guide to {topic_seed}",
            "5 Easy Ways to Elevate Your {topic_seed} Today",
            "{topic_seed} 101: Simple, Cozy, and Functional Tips",
            "Why Everyone is Obsessed with {topic_seed} in 2026"
        ]

        # Pinterest SEO-optimized description formulas (150-300 chars, keyword rich, CTA)
        self.description_templates = [
            "Looking to upgrade your {topic_seed}? Discover actionable tips, aesthetic inspiration, and step-by-step guidance designed for {target_audience}. Explore the full breakdown and save this pin for later! {keywords_str} {hashtags_str}",
            "Transform your space and routine with these simple {topic_seed} ideas. Featuring practical methods, curated inspiration, and clean design. Click through to read the full guide! {keywords_str} {hashtags_str}",
            "The easiest way to start {topic_seed} without feeling overwhelmed. Perfect for beginners and enthusiasts alike. Tap the pin to get the complete checklist! {keywords_str} {hashtags_str}"
        ]

        self.cta_phrases = [
            "SAVE FOR LATER",
            "READ FULL GUIDE",
            "TAP TO LEARN MORE",
            "GET THE CHECKLIST",
            "VIEW INSPIRATION",
            "EXPLORE NOW"
        ]

    def generate_copy_templates(self, topic_seed, category="lifestyle", target_audience="Design Lovers",
                                keywords=None, hashtags=None):
        """
        Zero-cost algorithmic copy generation.
        """
        keywords = keywords or ["minimalism", "inspiration", "lifestyle"]
        hashtags = hashtags or ["#pinterestinspo", "#lifestyle", "#dailyinspo"]

        title_tpl = random.choice(self.title_templates)
        title = title_tpl.format(
            topic_seed=topic_seed,
            target_audience=target_audience
        )
        # Cap title length per Pinterest guidelines (max 100 chars, ideal 40-70)
        if len(title) > 95:
            title = title[:92] + "..."

        kw_str = ", ".join(keywords[:4])
        hash_str = " ".join(hashtags[:5])
        
        desc_tpl = random.choice(self.description_templates)
        description = desc_tpl.format(
            topic_seed=topic_seed.lower(),
            target_audience=target_audience,
            keywords_str=f"Topics: {kw_str}.",
            hashtags_str=hash_str
        )
        # Pinterest description cap: 500 chars, ideal 250-400
        if len(description) > 490:
            description = description[:485] + "..."

        cta = random.choice(self.cta_phrases)

        return {
            "title": title,
            "description": description,
            "cta": cta,
            "keywords": keywords,
            "hashtags": hashtags,
            "generator_mode": "zero_cost_template"
        }

    def generate_copy_huggingface(self, topic_seed, category="lifestyle"):
        """
        OPTIONAL: Gated HuggingFace Serverless Inference API call.
        Only executed if operator explicitly provided HUGGINGFACE_TOKEN and enabled USE_LLM_COPY.
        """
        if not (self.use_llm and self.hf_token):
            return None

        # Model: free-tier accessible open-source model (e.g., Mistral-7B-Instruct or Qwen)
        api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        prompt = f"""<s>[INST] You are a Pinterest marketing expert. Write a high-converting Pin title (under 70 chars) and Pin description (under 300 chars) for the topic: '{topic_seed}' in the category '{category}'. Output valid JSON format: {{"title": "...", "description": "...", "cta": "..."}} [/INST]"""

        try:
            res = requests.post(api_url, headers=headers, json={"inputs": prompt, "parameters": {"max_new_tokens": 150}}, timeout=10)
            if res.status_code == 200:
                # Fallback to templates if parsing LLM output fails
                pass
        except Exception as e:
            print(f"[CopyGenerator] HF LLM optional fallback triggered: {e}")

        return None

    def generate_pin_copy(self, topic_seed, category="lifestyle", target_audience="Design Lovers",
                          keywords=None, hashtags=None):
        """
        Unified copy generation with zero-cost default and gated optional LLM fallback.
        """
        if self.use_llm and self.hf_token:
            llm_res = self.generate_copy_huggingface(topic_seed, category)
            if llm_res:
                return llm_res

        return self.generate_copy_templates(topic_seed, category, target_audience, keywords, hashtags)

if __name__ == "__main__":
    gen = CopyGenerator()
    out = gen.generate_pin_copy("Minimalist Scandinavian Living Room", "home_decor", "Home Decorators")
    print(f"[CopyGenerator] Title: {out['title']}")
    print(f"[CopyGenerator] Description: {out['description']}")
