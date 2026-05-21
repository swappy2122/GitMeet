import os
import json
import re
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
DEFAULT_MODEL = os.getenv("GEMINI_MODEL") or "gemini-1.5-flash"


def _build_config(system_instruction: str, max_output_tokens: int = 1024):
    return types.GenerateContentConfig(
        temperature=0.1,
        top_p=0.95,
        top_k=20,
        max_output_tokens=max_output_tokens,
        response_mime_type="application/json",
        system_instruction=system_instruction,
        safety_settings=[
            types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
        ],
    )

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
    lite_issues = _lite_issues(issues, limit=5, body_chars=200)

    # Keep prompt intentionally short to reduce tokens / latency.
    prompt = (
        f"User: {user_profile}. "
        f"Issues: {json.dumps(lite_issues, ensure_ascii=False)}. "
        "Return JSON: [{title,url,match_score,reason}]"
    )

    model_name = os.getenv("GEMINI_MODEL") or DEFAULT_MODEL
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=_build_config(
                "You are a fast JSON ranker. Match user skills to GitHub issues. "
                "Return ONLY a JSON array of up to 3 matches. No markdown.",
            ),
        )

        return _extract_json(response.text)
    except Exception as e:
        # Model not found or API error — fall back to a local heuristic to avoid 500s.
        print(f"Gemini generate_content failed for model '{model_name}': {e}. Falling back to heuristic ranking.")
        return _heuristic_rank(user_profile, lite_issues)


def _heuristic_rank(user_profile: str, lite_issues: list):
    """Simple fallback ranking: score issues by keyword overlap between profile and title/body."""
    try:
        profile_text = (user_profile or "").lower()
        results = []
        for it in lite_issues:
            title = (it.get("title") or "").lower()
            body = (it.get("body_snippet") or "").lower()
            score = 0
            for token in re.findall(r"\w+", profile_text):
                if token and (token in title or token in body):
                    score += 10
            # base score by presence of labels
            score += min(50, len(it.get("labels", [])) * 5)
            results.append({
                "id": it.get("id"),
                "title": it.get("title"),
                "url": it.get("url"),
                "repo": it.get("repo"),
                "match_score": min(100, 50 + score),
                "reason": "heuristic",
            })
        # sort by score desc and return top 3
        results.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        return results[:3]
    except Exception as e:
        print(f"Heuristic ranking failed: {e}")
        return []

async def get_personalized_matches_async(user_profile, lite_issues):
    """Async version to avoid blocking the FastAPI event loop.

    IMPORTANT: Keep the prompt tiny (titles/ids only) and cap runtime.
    """

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
        model_name = os.getenv("GEMINI_MODEL") or DEFAULT_MODEL
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config=_build_config(
                    "You are a fast JSON ranker. "
                    "Return ONLY a JSON array of up to 3 items, no markdown, no extra keys. "
                    "Schema: [{id,title,match_score}]",
                    max_output_tokens=200,
                ),
            )
            return _extract_json(response.text)
        except Exception as e:
            print(f"Async Gemini generate_content failed for model '{model_name}': {e}. Falling back to heuristic ranking.")
            return _heuristic_rank(user_profile, lite_issues)

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