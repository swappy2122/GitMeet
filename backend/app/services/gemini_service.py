import google.generativeai as genai
import os
import json
import re
import asyncio
from dotenv import load_dotenv
from google.generativeai.types import HarmCategory, HarmBlockThreshold

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Low-latency generation settings.
GENERATION_CONFIG = {
    "temperature": 0.1,
    "top_p": 0.95,
    "top_k": 20,
    "max_output_tokens": 1024,
    "response_mime_type": "application/json",
}

def _lite_issues(raw_issues: list, limit: int = 5, body_chars: int = 200) -> list:
    """Return a small, Gemini-friendly slice of GitHub issues."""
    lite = []
    for i in (raw_issues or [])[:limit]:
        labels = i.get("labels") or []
        lite.append(
            {
                "id": i.get("id"),
                "title": i.get("title"),
                "url": i.get("html_url") or i.get("url"),
                "labels": [l.get("name") for l in labels if isinstance(l, dict) and l.get("name")],
                "body_snippet": (i.get("body") or "")[:body_chars],
                "repo": (i.get("repository_url") or "").replace("https://api.github.com/repos/", ""),
            }
        )
    return lite

def _extract_json(raw_text: str):
    """Best-effort JSON extraction from Gemini text (handles markdown fences / extra text)."""
    if not raw_text:
        return []

    text = raw_text.strip()
    # Remove common markdown code fences first.
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except Exception:
        pass

    try:
        json_match = re.search(r"\[.*\]|\{.*\}", text, re.DOTALL)
        if not json_match:
            print("Error: No JSON found in Gemini response")
            return []
        return json.loads(json_match.group(0))
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        return []

def get_ai_matches(user_profile: str, issues: list):
    # Use Flash for speed.
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=(
            "You are a fast JSON ranker. Match user skills to GitHub issues. "
            "Return ONLY a JSON array of up to 3 matches. No markdown."
        ),
        generation_config=GENERATION_CONFIG,
    )

    # Disable aggressive safety filters for coding tasks
    safety = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    }

    lite_issues = _lite_issues(issues, limit=5, body_chars=200)

    # Keep prompt intentionally short to reduce tokens / latency.
    prompt = (
        f"User: {user_profile}. "
        f"Issues: {json.dumps(lite_issues, ensure_ascii=False)}. "
        "Return JSON: [{title,url,match_score,reason}]"
    )

    response = model.generate_content(
        prompt,
        safety_settings=safety,
    )

    return _extract_json(response.text)

async def get_personalized_matches_async(user_profile, lite_issues):
    """Async version to avoid blocking the FastAPI event loop.

    IMPORTANT: Keep the prompt tiny (titles/ids only) and cap runtime.
    """

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=(
            "You are a fast JSON ranker. "
            "Return ONLY a JSON array of up to 3 items, no markdown, no extra keys. "
            "Schema: [{id,title,match_score}]"
        ),
        generation_config={
            **GENERATION_CONFIG,
            "temperature": 0.1,
            "max_output_tokens": 200,
        },
    )

    # Keep only what's needed for ranking.
    pruned = []
    for i in (lite_issues or [])[:6]:
        pruned.append(
            {
                "id": i.get("id"),
                "title": i.get("title"),
            }
        )

    prompt = (
        "Rank these issue titles for the given developer profile. "
        "Return JSON only. "
        f"Profile: {json.dumps(user_profile, ensure_ascii=False)} "
        f"Issues: {json.dumps(pruned, ensure_ascii=False)}"
    )

    async def _call():
        response = await model.generate_content_async(prompt)
        return _extract_json(response.text)

    # Strict upper bound so API doesn't hang the client.
    return await asyncio.wait_for(_call(), timeout=15.0)

def get_personalized_matches(user_profile, lite_issues):
    """Sync wrapper (kept for compatibility). Prefer awaiting get_personalized_matches_async."""
    try:
        asyncio.get_running_loop()
        # We're already inside an event loop (e.g., FastAPI route). The caller must await async version.
        raise RuntimeError(
            "get_personalized_matches() was called from an async context. "
            "Use: await get_personalized_matches_async(user_profile, lite_issues)"
        )
    except RuntimeError as e:
        # If the error is 'no running event loop' then we can safely asyncio.run.
        if str(e).startswith("no running event loop"):
            return asyncio.run(get_personalized_matches_async(user_profile, lite_issues))
        raise

# Keep the old name as an alias for callers that still pass (user_github_data, raw_issues).
def get_personalized_matches_legacy(user_github_data, raw_issues):
    return get_personalized_matches(user_github_data, _lite_issues(raw_issues, limit=5, body_chars=150))