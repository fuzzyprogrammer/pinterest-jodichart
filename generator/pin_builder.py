"""
Pinterest Auto Marketer - Pin Builder
Orchestrates image generation, copy assembly, UTM link appending, and metadata serialization.
"""

import os
import json
import uuid
from datetime import datetime, timezone
from urllib.parse import urlencode, urlparse, urlunparse, parse_qs
from generator.image_processor import ImageProcessor
from generator.copy_generator import CopyGenerator

class PinBuilder:
    def __init__(self, unsplash_key=None, use_llm=False, hf_token=None):
        self.image_processor = ImageProcessor(unsplash_access_key=unsplash_key)
        self.copy_generator = CopyGenerator(use_llm=use_llm, hf_token=hf_token)

    def attach_utm_parameters(self, base_url, campaign="auto_marketer", content=None):
        """
        Attaches UTM tracking parameters for organic Pinterest analytics attribution.
        """
        if not base_url:
            base_url = "https://example.com"

        url_parts = list(urlparse(base_url))
        query = parse_qs(url_parts[4])
        query["utm_source"] = ["pinterest"]
        query["utm_medium"] = ["organic_pin"]
        query["utm_campaign"] = [campaign]
        if content:
            query["utm_content"] = [content]

        url_parts[4] = urlencode(query, doseq=True)
        return urlunparse(url_parts)

    def build_pin(self, topic_seed, category="lifestyle", target_board="Inspiration",
                  destination_url="https://example.com", style="modern_minimalist",
                  keywords=None, hashtags=None, target_audience="Enthusiasts", brand_name="NORDICHABITS"):
        """
        Assembles a complete Pin candidate: generates image, creates copy, attaches UTM link,
        computes hashes, and serializes metadata.
        """
        copy_data = self.copy_generator.generate_pin_copy(
            topic_seed=topic_seed,
            category=category,
            target_audience=target_audience,
            keywords=keywords,
            hashtags=hashtags
        )

        pin_id = f"pin_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        os.makedirs("logs/generated_pins", exist_ok=True)
        image_output_path = f"logs/generated_pins/{pin_id}.png"

        image_data = self.image_processor.compose_pin_image(
            headline=copy_data["title"],
            subhead=f"Tips & Guide for {target_audience}",
            cta=copy_data["cta"],
            brand=brand_name,
            query=f"{category} {topic_seed}",
            style=style,
            output_path=image_output_path
        )

        tracked_url = self.attach_utm_parameters(
            destination_url,
            campaign=f"pin_{category}",
            content=pin_id
        )

        metadata = {
            "pin_id": pin_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "category": category,
            "topic_seed": topic_seed,
            "title": copy_data["title"],
            "description": copy_data["description"],
            "cta": copy_data["cta"],
            "board_name": target_board,
            "destination_url": tracked_url,
            "base_url": destination_url,
            "visual_style": style,
            "image_path": image_data["image_path"],
            "dimensions": image_data["dimensions"],
            "perceptual_hash": image_data["phash"],
            "average_hash": image_data["ahash"],
            "attribution": image_data["attribution"],
            "keywords": copy_data["keywords"],
            "hashtags": copy_data["hashtags"],
            "status": "candidate_generated"
        }

        meta_json_path = f"logs/generated_pins/{pin_id}.json"
        with open(meta_json_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        return metadata

if __name__ == "__main__":
    builder = PinBuilder()
    pin = builder.build_pin(
        topic_seed="Minimalist Scandinavian Living Room",
        category="home_decor",
        target_board="Cozy Homes",
        destination_url="https://example.com/scandi-living"
    )
    print(f"[PinBuilder] Generated pin: {pin['pin_id']} -> {pin['image_path']}")
