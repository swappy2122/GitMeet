from fastapi import APIRouter, Header, HTTPException
import httpx
import asyncio
from typing import Optional

from app.services.gemini_service import get_personalized_matches_async

router = APIRouter()

GITHUB_API = "https://api.github.com"

@router.get("/explore")
async def explore_trending_issues(
    authorization: str = Header(None),
    fast: Optional[bool] = True,
    limit: int = 12,
):
    try:
        # 1. Check for Token
        if not authorization:
            return {"error": "Missing Authorization Header"}

        # NOTE: Mock return removed; endpoint now calls GitHub (and optionally Gemini).

        # 2. Real implementation
        parts = authorization.split(" ")
        token = parts[-1]  # supports both "Bearer <token>" and raw tokens
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json",
        }

        # Keep this endpoint snappy. The frontend hard-times out at ~2s.
        timeout = httpx.Timeout(connect=2.0, read=4.0, write=2.0, pool=2.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            # 1) Fetch user's recently-updated repos and extract top languages
            repos_resp = await client.get(
                f"{GITHUB_API}/user/repos",
                params={"sort": "updated", "per_page": 30},
                headers=headers,
            )

            if repos_resp.status_code == 401:
                return {"error": "Unauthorized", "details": "Bad/expired GitHub token"}
            repos_resp.raise_for_status()

            repos = repos_resp.json() or []
            languages = list({r.get("language") for r in repos if isinstance(r, dict) and r.get("language")})[:2]

            if not languages:
                # Still allow falling back to a generic query if we can't infer languages.
                languages = [None]

            # 2) Fetch a small set of "good first issue" items for those languages
            lite_issues = []
            for language in languages:
                query = "label:\"good first issue\" state:open"
                if language:
                    query += f" language:{language}"

                issues_resp = await client.get(
                    f"{GITHUB_API}/search/issues",
                    params={"q": query, "per_page": 6},
                    headers=headers,
                )
                issues_resp.raise_for_status()
                raw_issues = (issues_resp.json() or {}).get("items", [])

                # prune to keep Gemini fast
                for i in raw_issues[:4]:
                    if not isinstance(i, dict):
                        continue
                    repo_url = i.get("repository_url") or ""
                    lite_issues.append(
                        {
                            "id": i.get("id"),
                            "title": i.get("title"),
                            "repo": repo_url.replace("https://api.github.com/repos/", "") if repo_url else None,
                            "url": i.get("html_url"),
                            "labels": [
                                l.get("name")
                                for l in (i.get("labels") or [])
                                if isinstance(l, dict) and l.get("name")
                            ],
                            "body_snippet": (i.get("body") or "")[:120],
                        }
                    )

            # 3) Fetch user profile
            user_resp = await client.get(f"{GITHUB_API}/user", headers=headers)
            user_resp.raise_for_status()
            user = user_resp.json() or {}
            user_profile = {
                "username": user.get("login"),
                "bio": user.get("bio"),
                "top_languages": [l for l in languages if l],
            }

        # Respect limit regardless of path.
        lite_issues = lite_issues[: max(1, min(limit, 50))]

        # 4) Fast path: return immediately.
        if fast:
            return lite_issues

        # 5) Slow path: ask Gemini to rank.
        try:
            matches = await asyncio.wait_for(
                get_personalized_matches_async(user_profile, lite_issues),
                timeout=8.0,
            )

            # If Gemini returns an empty/bad payload, fall back.
            if not isinstance(matches, list) or not matches:
                return lite_issues

            # Merge match_score back onto issues when possible.
            score_by_id = {m.get("id"): m.get("match_score") for m in matches if isinstance(m, dict)}
            for it in lite_issues:
                if it.get("id") in score_by_id:
                    it["match_score"] = score_by_id[it.get("id")]

            return lite_issues
        except Exception as e:
            print(f"Error in /explore AI ranking (fallback to lite issues): {e}")
            return lite_issues

    except httpx.HTTPStatusError as e:
        status = getattr(e.response, "status_code", 500)
        body = None
        try:
            body = e.response.json()
        except Exception:
            body = getattr(e.response, "text", None)
        print(f"🔥 BACKEND CRASH: GitHub HTTP error {status}: {body}")
        return {"error": "Upstream GitHub Error", "status": status, "details": body}
    except Exception as e:
        print(f"🔥 BACKEND CRASH: {str(e)}")
        return {"error": "Internal Server Error", "details": str(e)}