"""
Pinterest Auto Marketer - Pinterest API v5 Adapter
Abstracted client for Pinterest Business API (v5).
Features:
- Safe media register & upload handshake (S3 presigned POST)
- Pin creation endpoint (POST /v5/pins)
- Exponential backoff with jitter on 429 / 5xx
- Clear TODO comments with official Pinterest v5 documentation links for human operators.
"""

import os
import time
import random
import requests
import json

class PinterestAPIClient:
    """
    Pinterest Business API v5 client.
    Documentation: https://developers.pinterest.com/docs/api/v5/
    """
    BASE_URL = "https://api.pinterest.com/v5"

    def __init__(self, access_token=None, board_id=None, max_retries=5):
        self.access_token = access_token or os.getenv("PINTEREST_ACCESS_TOKEN")
        self.board_id = board_id or os.getenv("PINTEREST_BOARD_ID")
        self.max_retries = max_retries

    def get_headers(self):
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def _execute_with_backoff(self, method, url, headers=None, json_data=None, files=None):
        """
        Executes HTTP request with exponential backoff and randomized jitter to handle rate limits gracefully.
        """
        delay = 2.0
        backoff_factor = 2.0
        
        for attempt in range(1, self.max_retries + 1):
            try:
                # Add randomized jitter between calls (2 to 5 seconds) to avoid robotic bursts
                jitter = random.uniform(1.0, 3.5)
                time.sleep(jitter)

                res = requests.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=json_data,
                    files=files,
                    timeout=30
                )

                # Success
                if res.status_code in [200, 201]:
                    return True, res.json()

                # Rate Limit (429) or Transient Server Error (5xx)
                if res.status_code == 429 or res.status_code >= 500:
                    retry_after = res.headers.get("Retry-After")
                    sleep_time = float(retry_after) if retry_after else (delay + random.uniform(0.5, 2.0))
                    print(f"[PinterestAPI] Received HTTP {res.status_code}. Backing off for {sleep_time:.2f}s (Attempt {attempt}/{self.max_retries})")
                    time.sleep(sleep_time)
                    delay *= backoff_factor
                    continue

                # Client Error (400, 401, 403, 404)
                print(f"[PinterestAPI] Request failed with HTTP {res.status_code}: {res.text}")
                return False, {"error": res.text, "status_code": res.status_code}

            except requests.exceptions.RequestException as e:
                print(f"[PinterestAPI] Network exception (Attempt {attempt}/{self.max_retries}): {e}")
                time.sleep(delay)
                delay *= backoff_factor

        return False, {"error": "Exceeded maximum retry attempts", "status_code": None}

    def register_media_upload(self):
        """
        TODO (Human Operator):
        Pinterest API v5 media upload is a 3-step process:
        1. Register upload: POST /v5/media -> returns upload_url and upload_parameters
        2. Upload binary to AWS S3 using presigned upload_parameters
        3. Query status: GET /v5/media/{media_id} until status == 'succeeded'
        Reference: https://developers.pinterest.com/docs/api/v5/#operation/media/create
        """
        url = f"{self.BASE_URL}/media"
        payload = {
            "media_type": "image"
        }
        return self._execute_with_backoff("POST", url, headers=self.get_headers(), json_data=payload)

    def upload_image_binary(self, upload_url, upload_params, image_path):
        """
        Step 2 of media upload: POST the image file to Pinterest's presigned S3 storage bucket.
        """
        if not os.path.exists(image_path):
            return False, {"error": f"Local image file not found: {image_path}"}

        try:
            with open(image_path, "rb") as f:
                files = {"file": f}
                res = requests.post(upload_url, data=upload_params, files=files, timeout=40)
                if res.status_code in [200, 204]:
                    return True, {"status": "uploaded"}
                return False, {"error": res.text, "status_code": res.status_code}
        except Exception as e:
            return False, {"error": str(e)}

    def check_media_status(self, media_id):
        """
        Step 3 of media upload: Query Pinterest until media is processed.
        GET /v5/media/{media_id}
        """
        url = f"{self.BASE_URL}/media/{media_id}"
        return self._execute_with_backoff("GET", url, headers=self.get_headers())

    def create_pin(self, title, description, link, media_id=None, image_url=None, board_id=None, alt_text=None):
        """
        Creates a new Pin on Pinterest Business API v5.
        POST /v5/pins
        Documentation: https://developers.pinterest.com/docs/api/v5/#operation/pins/create

        Payload fields:
        - board_id: ID of the board to place the pin (Required)
        - title: String (max 100 characters)
        - description: String (max 800 characters)
        - link: Destination URL (with UTM tracking)
        - media_source: Dict containing source_type ('image_id' or 'image_url')
        - alt_text: Accessibility text for the image
        """
        target_board_id = board_id or self.board_id
        if not target_board_id:
            return False, {"error": "Missing PINTEREST_BOARD_ID. Required for pin creation."}

        url = f"{self.BASE_URL}/pins"
        
        # Build media source structure
        if media_id:
            media_source = {
                "source_type": "image_id",
                "media_id": media_id
            }
        elif image_url:
            media_source = {
                "source_type": "image_url",
                "url": image_url
            }
        else:
            return False, {"error": "Must provide either media_id (uploaded media) or public image_url"}

        payload = {
            "board_id": target_board_id,
            "title": title[:100],
            "description": description[:800],
            "link": link,
            "media_source": media_source,
            "alt_text": alt_text or title[:100]
        }

        return self._execute_with_backoff("POST", url, headers=self.get_headers(), json_data=payload)

    def get_pin_analytics(self, pin_id, start_date, end_date):
        """
        Pulls metrics for an individual Pin: impressions, saves, clicks.
        GET /v5/pins/{pin_id}/analytics
        Documentation: https://developers.pinterest.com/docs/api/v5/#operation/pins_analytics/get
        """
        url = f"{self.BASE_URL}/pins/{pin_id}/analytics"
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "metric_types": "IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE"
        }
        query_str = f"{url}?start_date={start_date}&end_date={end_date}&metric_types=IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE"
        return self._execute_with_backoff("GET", query_str, headers=self.get_headers())
