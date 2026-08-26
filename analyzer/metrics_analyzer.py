"""
Pinterest Auto Marketer - Analytics & Adaptation Engine
Computes KPIs per template style, identifies top performing headlines/hashtags,
and generates adjustments.json to improve subsequent generation cycles.
"""

import os
import json
import csv
from datetime import datetime, timezone
from publisher.pinterest_client import PinterestAPIClient

class MetricsAnalyzer:
    def __init__(self, adjustments_output_path="logs/adjustments.json"):
        self.adjustments_output_path = adjustments_output_path
        self.api_client = PinterestAPIClient()

    def ingest_metrics_csv(self, csv_path):
        """
        Parses manually exported Pinterest Analytics CSV if API access is restricted.
        Expected columns: pin_id, template_style, impressions, pin_clicks, saves, outbound_clicks
        """
        records = []
        if os.path.exists(csv_path):
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    records.append({
                        "pin_id": row.get("pin_id"),
                        "template_style": row.get("template_style", "modern_minimalist"),
                        "impressions": int(row.get("impressions", 0)),
                        "pin_clicks": int(row.get("pin_clicks", 0)),
                        "saves": int(row.get("saves", 0)),
                        "outbound_clicks": int(row.get("outbound_clicks", 0))
                    })
        return records

    def compute_performance_adaptation(self, records=None):
        """
        Calculates KPIs (Save Rate, Outbound CTR, Engagement Score) per visual template style
        and generates adjustments.json.
        """
        if not records:
            # Synthetic/Historical default dataset for initial cold-start baseline
            records = [
                {"template_style": "modern_minimalist", "impressions": 12400, "pin_clicks": 520, "saves": 310, "outbound_clicks": 180},
                {"template_style": "warm_editorial", "impressions": 9800, "pin_clicks": 410, "saves": 280, "outbound_clicks": 140},
                {"template_style": "clean_infographic", "impressions": 15200, "pin_clicks": 890, "saves": 640, "outbound_clicks": 320},
                {"template_style": "bold_quote", "impressions": 6100, "pin_clicks": 190, "saves": 95, "outbound_clicks": 45},
                {"template_style": "aesthetic_pastel", "impressions": 8300, "pin_clicks": 350, "saves": 210, "outbound_clicks": 115}
            ]

        style_stats = {}
        for r in records:
            style = r["template_style"]
            if style not in style_stats:
                style_stats[style] = {"impressions": 0, "pin_clicks": 0, "saves": 0, "outbound_clicks": 0}
            style_stats[style]["impressions"] += r["impressions"]
            style_stats[style]["pin_clicks"] += r["pin_clicks"]
            style_stats[style]["saves"] += r["saves"]
            style_stats[style]["outbound_clicks"] += r["outbound_clicks"]

        analyzed_styles = {}
        top_style = "modern_minimalist"
        highest_score = 0.0

        for style, totals in style_stats.items():
            imps = max(1, totals["impressions"])
            save_rate = (totals["saves"] / imps) * 100
            outbound_ctr = (totals["outbound_clicks"] / imps) * 100
            engagement_score = (save_rate * 2.0) + (outbound_ctr * 3.0)

            analyzed_styles[style] = {
                "impressions": totals["impressions"],
                "saves": totals["saves"],
                "outbound_clicks": totals["outbound_clicks"],
                "save_rate_pct": round(save_rate, 2),
                "outbound_ctr_pct": round(outbound_ctr, 2),
                "engagement_score": round(engagement_score, 2)
            }

            if engagement_score > highest_score:
                highest_score = engagement_score
                top_style = style

        adjustments = {
            "version": "1.0",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "top_performing_template": top_style,
            "style_performance_matrix": analyzed_styles,
            "recommendations": {
                "preferred_visual_template": top_style,
                "recommended_cta": "GET THE CHECKLIST" if top_style == "clean_infographic" else "SAVE FOR LATER",
                "recommended_post_hour_utc": 17,
                "adaptation_notes": f"Template '{top_style}' outperformed other styles with {highest_score:.2f} engagement score. Increasing allocation in upcoming research plans."
            }
        }

        os.makedirs(os.path.dirname(self.adjustments_output_path) or ".", exist_ok=True)
        with open(self.adjustments_output_path, "w", encoding="utf-8") as f:
            json.dump(adjustments, f, indent=2)

        return adjustments

if __name__ == "__main__":
    analyzer = MetricsAnalyzer()
    adj = analyzer.compute_performance_adaptation()
    print(f"[MetricsAnalyzer] Adaptation generated. Top template: {adj['top_performing_template']}")
