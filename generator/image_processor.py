"""
Pinterest Auto Marketer - Image Processor (Zero-Cost First)
Handles 1000x1500 2:3 Pinterest pin generation using Pillow (OSS).
Supports Unsplash free tier API or procedural high-res aesthetic backgrounds with zero GPU costs.
Computes perceptual hash (imagehash) for deduplication.
"""

import os
import requests
import imagehash
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import io

class ImageProcessor:
    def __init__(self, unsplash_access_key=None):
        self.unsplash_access_key = unsplash_access_key or os.getenv("UNSPLASH_ACCESS_KEY")
        self.target_size = (1000, 1500) # Standard Pinterest 2:3 ratio

    def fetch_unsplash_image(self, query="minimalist aesthetic"):
        """
        Fetches free Unsplash image adhering to API terms and captures photographer attribution.
        Returns PIL Image and attribution dict, or None if key missing/rate-limited.
        """
        if not self.unsplash_access_key:
            return None, None

        url = "https://api.unsplash.com/photos/random"
        headers = {"Authorization": f"Client-ID {self.unsplash_access_key}"}
        params = {
            "query": query,
            "orientation": "portrait",
            "content_filter": "high"
        }
        try:
            res = requests.get(url, headers=headers, params=params, timeout=10)
            if res.status_code == 200:
                data = res.json()
                img_url = data.get("urls", {}).get("regular")
                author = data.get("user", {}).get("name", "Unsplash Contributor")
                author_url = data.get("user", {}).get("links", {}).get("html", "https://unsplash.com")
                
                img_res = requests.get(img_url, timeout=15)
                if img_res.status_code == 200:
                    img = Image.open(io.BytesIO(img_res.content)).convert("RGB")
                    attribution = {
                        "source": "Unsplash",
                        "photographer": author,
                        "photographer_url": author_url,
                        "download_location": data.get("links", {}).get("download_location")
                    }
                    # Optional Unsplash download event trigger per API guidelines
                    return img, attribution
        except Exception as e:
            print(f"[ImageProcessor] Unsplash fetch fallback triggered: {e}")
        return None, None

    def create_procedural_background(self, style="modern_minimalist"):
        """
        Generates a clean, zero-cost procedural gradient/color block background.
        No external network or GPU required.
        """
        width, height = self.target_size
        base = Image.new("RGB", (width, height), color=(248, 246, 242))
        draw = ImageDraw.Draw(base)

        color_palettes = {
            "modern_minimalist": ((245, 245, 240), (220, 215, 205), (45, 45, 45)),
            "warm_editorial": ((250, 240, 230), (225, 195, 170), (60, 40, 30)),
            "clean_infographic": ((240, 248, 255), (190, 220, 245), (20, 40, 80)),
            "bold_quote": ((30, 32, 40), (60, 65, 80), (255, 255, 255)),
            "aesthetic_pastel": ((253, 242, 248), (244, 215, 230), (75, 45, 60))
        }

        top_color, bottom_color, _ = color_palettes.get(style, color_palettes["modern_minimalist"])

        # Vertical smooth gradient
        for y in range(height):
            ratio = y / float(height)
            r = int(top_color[0] * (1 - ratio) + bottom_color[0] * ratio)
            g = int(top_color[1] * (1 - ratio) + bottom_color[1] * ratio)
            b = int(top_color[2] * (1 - ratio) + bottom_color[2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Decorative geometric frame
        margin = 40
        draw.rectangle(
            [(margin, margin), (width - margin, height - margin)],
            outline=(200, 195, 185) if style != "bold_quote" else (80, 85, 100),
            width=2
        )

        return base

    def compose_pin_image(self, headline, subhead=None, cta="SAVE THIS PIN", brand="NORDICHABITS",
                          query="aesthetic", style="modern_minimalist", output_path=None):
        """
        Renders complete Pinterest pin graphic (1000x1500 px) with readable contrast overlay,
        typography wrapping, CTA badge, brand watermark, and perceptual hash.
        """
        # Step 1: Base image (Unsplash free or Procedural fallback)
        raw_img, attribution = self.fetch_unsplash_image(query)
        if raw_img:
            # Crop to 2:3 aspect ratio and resize to 1000x1500
            raw_w, raw_h = raw_img.size
            target_ratio = 1000 / 1500
            curr_ratio = raw_w / raw_h
            if curr_ratio > target_ratio:
                new_w = int(raw_h * target_ratio)
                left = (raw_w - new_w) // 2
                raw_img = raw_img.crop((left, 0, left + new_w, raw_h))
            else:
                new_h = int(raw_w / target_ratio)
                top = (raw_h - new_h) // 2
                raw_img = raw_img.crop((0, top, raw_w, top + new_h))
            base_img = raw_img.resize(self.target_size, Image.Resampling.LANCZOS)
        else:
            base_img = self.create_procedural_background(style)
            attribution = {"source": "procedural_canvas", "photographer": "system", "photographer_url": ""}

        # Step 2: Overlay Card for High-Readability Contrast
        overlay = Image.new("RGBA", self.target_size, (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)

        card_margin_x = 70
        card_y1 = 280
        card_y2 = 1200
        card_bg = (255, 255, 255, 235) if style != "bold_quote" else (20, 22, 28, 240)
        draw_ov.rounded_rectangle([(card_margin_x, card_y1), (1000 - card_margin_x, card_y2)], radius=24, fill=card_bg)

        # Merge overlay onto base
        base_img = base_img.convert("RGBA")
        combined = Image.alpha_composite(base_img, overlay).convert("RGB")
        draw = ImageDraw.Draw(combined)

        # Colors
        text_color = (25, 25, 25) if style != "bold_quote" else (245, 245, 245)
        accent_color = (180, 83, 9) if style != "bold_quote" else (251, 191, 36)
        cta_bg = (30, 30, 30) if style != "bold_quote" else (230, 230, 230)
        cta_text_color = (255, 255, 255) if style != "bold_quote" else (20, 20, 20)

        # Fonts (Fallback gracefully to default PIL font if system TTF unavailable)
        try:
            font_headline = ImageFont.truetype("DejaVuSans-Bold.ttf", 52)
            font_subhead = ImageFont.truetype("DejaVuSans.ttf", 30)
            font_brand = ImageFont.truetype("DejaVuSans-Bold.ttf", 24)
            font_cta = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
        except Exception:
            font_headline = ImageFont.load_default()
            font_subhead = ImageFont.load_default()
            font_brand = ImageFont.load_default()
            font_cta = ImageFont.load_default()

        # Step 3: Brand Badge at Top
        draw.text((500, card_y1 + 50), brand.upper(), fill=accent_color, font=font_brand, anchor="mm")
        draw.line([(420, card_y1 + 80), (580, card_y1 + 80)], fill=accent_color, width=2)

        # Step 4: Headline with wrapping
        words = headline.split()
        lines = []
        cur_line = []
        for w in words:
            cur_line.append(w)
            if len(" ".join(cur_line)) > 24:
                lines.append(" ".join(cur_line))
                cur_line = []
        if cur_line:
            lines.append(" ".join(cur_line))

        headline_text = "\n".join(lines[:4])
        draw.multiline_text((500, card_y1 + 250), headline_text, fill=text_color, font=font_headline,
                            anchor="mm", align="center", spacing=14)

        # Step 5: Subhead
        if subhead:
            draw.text((500, card_y1 + 480), subhead, fill=(100, 100, 100) if style != "bold_quote" else (180, 180, 180),
                      font=font_subhead, anchor="mm")

        # Step 6: CTA Button
        cta_box_w = 420
        cta_box_h = 70
        cta_cx = 500
        cta_cy = card_y2 - 90
        draw.rounded_rectangle(
            [(cta_cx - cta_box_w // 2, cta_cy - cta_box_h // 2),
             (cta_cx + cta_box_w // 2, cta_cy + cta_box_h // 2)],
            radius=16,
            fill=cta_bg
        )
        draw.text((cta_cx, cta_cy), cta.upper(), fill=cta_text_color, font=font_cta, anchor="mm")

        # Step 7: Compute Perceptual Hash
        p_hash = str(imagehash.phash(combined))
        a_hash = str(imagehash.average_hash(combined))

        # Save output
        if not output_path:
            os.makedirs("logs/generated_images", exist_ok=True)
            output_path = f"logs/generated_images/pin_{p_hash[:10]}.png"

        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        combined.save(output_path, "PNG", quality=95)

        return {
            "image_path": output_path,
            "dimensions": self.target_size,
            "phash": p_hash,
            "ahash": a_hash,
            "attribution": attribution
        }

if __name__ == "__main__":
    proc = ImageProcessor()
    res = proc.compose_pin_image(
        headline="10 Minimalist Living Room Ideas That Feel Cozy & Functional",
        subhead="Simple Nordic styling hacks for 2026",
        cta="VIEW FULL GUIDE",
        output_path="logs/example_pin.png"
    )
    print(f"[ImageProcessor] Generated image at: {res['image_path']} with phash: {res['phash']}")
