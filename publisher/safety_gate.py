"""
Pinterest Auto Marketer - Safety Gatekeeper
Strict security and operational guardrails:
- Requires ENABLE_PUBLISH="true" AND valid PINTEREST_ACCESS_TOKEN to make network calls.
- Enforces DRY_RUN_MODE by default (simulates exact payloads and logs them).
- Daily Cap Enforcement (MAX_PINS_PER_DAY) via logs/daily_published.json.
- Persistent audit logging for 100% auditable history.
"""

import os
import json
import time
import random
from datetime import datetime, timezone
from publisher.pinterest_client import PinterestAPIClient
from dedupe_safety.dedupe_engine import DedupeSafetyEngine

class SafetyGatekeeper:
    def __init__(self, daily_log_path="logs/daily_published.json", audit_log_path="logs/publish_audit.log"):
        self.daily_log_path = daily_log_path
        self.audit_log_path = audit_log_path
        
        # Environmental configuration
        self.enable_publish = os.getenv("ENABLE_PUBLISH", "false").lower() == "true"
        self.dry_run_mode = os.getenv("DRY_RUN_MODE", "true").lower() != "false"
        self.access_token = os.getenv("PINTEREST_ACCESS_TOKEN", "").strip()
        self.board_id = os.getenv("PINTEREST_BOARD_ID", "").strip()
        self.max_pins_per_day = int(os.getenv("MAX_PINS_PER_DAY", "10"))
        
        self.dedupe_engine = DedupeSafetyEngine()
        self.api_client = PinterestAPIClient(access_token=self.access_token, board_id=self.board_id)

    def get_today_publish_count(self):
        """Reads persistent store for count of pins published/simulated today."""
        today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if os.path.exists(self.daily_log_path):
            try:
                with open(self.daily_log_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return data.get(today_date, {}).get("count", 0), data
            except Exception:
                pass
        return 0, {}

    def increment_today_publish_count(self, pin_id, mode="simulated"):
        """Increments today's published count in persistent JSON storage."""
        today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        count, data = self.get_today_publish_count()
        
        if today_date not in data:
            data[today_date] = {"count": 0, "pins": []}
            
        data[today_date]["count"] = data[today_date].get("count", 0) + 1
        data[today_date]["pins"].append({
            "pin_id": pin_id,
            "mode": mode,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        os.makedirs(os.path.dirname(self.daily_log_path) or ".", exist_ok=True)
        with open(self.daily_log_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def write_audit_log(self, status, action, pin_id, details, payload=None):
        """Appends structured audit log to logs/publish_audit.log."""
        os.makedirs(os.path.dirname(self.audit_log_path) or ".", exist_ok=True)
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": status,
            "action": action,
            "pin_id": pin_id,
            "details": details,
            "payload_snapshot": payload or {}
        }
        with open(self.audit_log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")

    def publish_pin(self, pin_metadata, override_force=False):
        """
        Gated execution flow:
        1. Deduplication & policy validation.
        2. Daily cap check.
        3. Safety gating check (ENABLE_PUBLISH and token presence).
        4. Dispatch either simulated dry-run or real Pinterest API call with jitter.
        """
        pin_id = pin_metadata.get("pin_id", "unknown_pin")
        title = pin_metadata.get("title", "")
        description = pin_metadata.get("description", "")
        link = pin_metadata.get("destination_url", "")
        image_path = pin_metadata.get("image_path", "")
        
        # Step 1: Safety & Deduplication
        safety_eval = self.dedupe_engine.evaluate_pin_safety(pin_metadata)
        if not safety_eval["safe_to_publish"] and not override_force:
            msg = f"Rejected by Dedupe/Safety: {safety_eval['details']}"
            self.write_audit_log("REJECTED", "DEDUPE_CHECK", pin_id, msg)
            return {
                "success": False,
                "status": "REJECTED_DEDUPE",
                "message": msg,
                "pin_id": pin_id
            }

        # Step 2: Daily Cap Enforcement
        today_count, _ = self.get_today_publish_count()
        if today_count >= self.max_pins_per_day and not override_force:
            msg = f"Daily cap reached ({today_count}/{self.max_pins_per_day} pins). Refusing publication for safety."
            self.write_audit_log("THROTTLED", "DAILY_CAP", pin_id, msg)
            return {
                "success": False,
                "status": "THROTTLED_DAILY_CAP",
                "message": msg,
                "pin_id": pin_id,
                "today_count": today_count,
                "max_cap": self.max_pins_per_day
            }

        # Build simulated payload representation
        simulated_payload = {
            "board_id": self.board_id or "BOARD_ID_PLACEHOLDER",
            "title": title,
            "description": description,
            "link": link,
            "media_source": {
                "source_type": "image_id",
                "local_file": image_path,
                "media_id": f"media_{random.randint(100000, 999999)}"
            }
        }

        # Step 3: Check Gating Flag
        is_live_ready = (self.enable_publish is True) and (self.dry_run_mode is False) and bool(self.access_token)

        if not is_live_ready:
            # DRY RUN / SIMULATION MODE
            mode_reason = []
            if not self.enable_publish:
                mode_reason.append("ENABLE_PUBLISH=false")
            if self.dry_run_mode:
                mode_reason.append("DRY_RUN_MODE=true")
            if not self.access_token:
                mode_reason.append("PINTEREST_ACCESS_TOKEN missing")

            reason_str = ", ".join(mode_reason)
            sim_msg = f"[DRY_RUN SIMULATION] Pin prepared safely ({reason_str}). No external API POST made."
            
            # Record in daily tracker and persistent dedupe registry so dry-run behaves identically
            self.increment_today_publish_count(pin_id, mode="simulated")
            self.dedupe_engine.register_published_pin(pin_metadata)
            self.write_audit_log("SIMULATED_SUCCESS", "DRY_RUN_PUBLISH", pin_id, sim_msg, payload=simulated_payload)

            return {
                "success": True,
                "status": "SIMULATED_PUBLISHED",
                "message": sim_msg,
                "pin_id": pin_id,
                "payload": simulated_payload,
                "mode": "dry_run",
                "reasons": mode_reason
            }

        # Step 4: LIVE PRODUCTION PUBLISHING
        print(f"[SafetyGatekeeper] LIVE PUBLISH ENGAGED for pin {pin_id}...")
        
        # Step 4a: Register and upload media
        media_reg_ok, media_data = self.api_client.register_media_upload()
        if not media_reg_ok:
            err_msg = f"Pinterest media registration failed: {media_data}"
            self.write_audit_log("FAILED", "MEDIA_REGISTER", pin_id, err_msg)
            return {"success": False, "status": "MEDIA_REG_FAILED", "message": err_msg}

        media_id = media_data.get("media_id")
        upload_url = media_data.get("upload_url")
        upload_params = media_data.get("upload_parameters", {})

        # Step 4b: Binary S3 upload
        bin_ok, bin_data = self.api_client.upload_image_binary(upload_url, upload_params, image_path)
        if not bin_ok:
            err_msg = f"S3 binary upload failed: {bin_data}"
            self.write_audit_log("FAILED", "S3_UPLOAD", pin_id, err_msg)
            return {"success": False, "status": "S3_UPLOAD_FAILED", "message": err_msg}

        # Step 4c: Wait for processing (with small polling loop)
        time.sleep(3)

        # Step 4d: Create Pin
        pin_ok, pin_res = self.api_client.create_pin(
            title=title,
            description=description,
            link=link,
            media_id=media_id,
            board_id=self.board_id
        )

        if pin_ok:
            pub_msg = f"Successfully published to Pinterest live. Pin ID: {pin_res.get('id')}"
            self.increment_today_publish_count(pin_id, mode="live_published")
            self.dedupe_engine.register_published_pin(pin_metadata)
            self.write_audit_log("LIVE_SUCCESS", "PIN_CREATE", pin_id, pub_msg, payload=pin_res)
            return {
                "success": True,
                "status": "LIVE_PUBLISHED",
                "message": pub_msg,
                "pin_id": pin_id,
                "pinterest_pin_id": pin_res.get("id"),
                "response": pin_res
            }
        else:
            err_msg = f"Live Pin creation failed: {pin_res}"
            self.write_audit_log("FAILED", "PIN_CREATE", pin_id, err_msg)
            return {
                "success": False,
                "status": "LIVE_API_ERROR",
                "message": err_msg
            }

if __name__ == "__main__":
    gate = SafetyGatekeeper()
    dummy = {
        "pin_id": "test_pin_999",
        "title": "Aesthetic Scandinavian Bedroom Decor Guide",
        "description": "How to create a serene cozy bedroom with minimalist textures and lighting.",
        "destination_url": "https://example.com/scandi-bedroom",
        "image_path": "logs/example_pin.png",
        "board_name": "Interior Ideas",
        "topic_seed": "Scandi Bedroom",
        "perceptual_hash": "a1b2c3d4e5f60718"
    }
    res = gate.publish_pin(dummy)
    print(f"[SafetyGatekeeper] Result: {res['status']} -> {res['message']}")
