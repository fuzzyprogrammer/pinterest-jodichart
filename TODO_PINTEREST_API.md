# 📋 Human Operator Action Checklist: Pinterest Business API v5

The automated engine contains full abstracted skeletons with zero hardcoded credentials. To activate live publishing, complete the following human operator action items:

---

## 🔑 1. Pinterest Developer Portal Setup
- [ ] Log into the [Pinterest Developer Portal](https://developers.pinterest.com/apps/).
- [ ] Create a new Business Application (e.g., `Auto-Marketer-Client`).
- [ ] Request the following OAuth Scopes:
  - `boards:read` (Query boards and discover target Board IDs)
  - `pins:read` (Read pin metrics and performance)
  - `pins:write` (Create pins and upload media)
  - `user_accounts:read` (Verify business account identity)
- [ ] Generate a long-lived User Access Token or configure refresh token handling.

---

## 🎯 2. Board ID Discovery
Pinterest API v5 requires the specific alphanumeric `board_id` (not just the board title).
Run the following cURL query to list your account's boards:
```bash
curl -X GET "https://api.pinterest.com/v5/boards" \
  -H "Authorization: Bearer YOUR_PINTEREST_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```
Copy the desired `"id"` (e.g., `112233445566778899`) and set it as `PINTEREST_BOARD_ID`.

---

## 🖼️ 3. Media Upload Handshake Verification
Pinterest v5 uses an AWS S3 presigned POST flow:
- **Step 1**: `POST https://api.pinterest.com/v5/media` with `{"media_type": "image"}`. Response contains `upload_url`, `media_id`, and `upload_parameters`.
- **Step 2**: POST binary image to `upload_url` with `upload_parameters`.
- **Step 3**: Poll `GET https://api.pinterest.com/v5/media/{media_id}` until `status == "succeeded"`.
- **Step 4**: `POST https://api.pinterest.com/v5/pins` with `{"board_id": "...", "media_source": {"source_type": "image_id", "media_id": "{media_id}"}}`.

*Note: All logic is already implemented in `publisher/pinterest_client.py` and `publisher/safety_gate.py`.*

---

## ⚙️ 4. GitHub Actions Secrets Configuration
In your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**.
2. Add the following repository secrets:
   - `PINTEREST_ACCESS_TOKEN`: Your generated OAuth token
   - `PINTEREST_BOARD_ID`: Your board ID
   - `ENABLE_PUBLISH`: Set to `true` when ready to go live
   - `DRY_RUN_MODE`: Set to `false` when ready to go live
   - `MAX_PINS_PER_DAY`: `3` (for week 1-2 ramp-up)
   - `UNSPLASH_ACCESS_KEY`: (Optional) Free API key from Unsplash Developer Portal
   - `HUGGINGFACE_TOKEN`: (Optional) Free token if testing LLM copy prompts
