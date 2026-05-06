import requests
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}


def clean_issue_data(raw_issues):
    """Token guillotine: keep only the absolute essentials for AI matching."""
    return [
        {
            "title": i.get("title"),
            "labels": [l.get("name") for l in i.get("labels", []) if isinstance(l, dict) and l.get("name")],
            "body": (i.get("body") or "")[:150],
            "url": i.get("html_url") or i.get("url"),
        }
        for i in (raw_issues or [])[:3]
    ]


def fetch_open_issues(query="label:\"good first issue\" state:open", token=None, limit=3):
    # Prefer the user's token so search results reflect their GitHub access.
    headers = {"Authorization": f"token {token}"} if token else HEADERS
    url = f"https://api.github.com/search/issues?q={query}&per_page={limit}"
    response = requests.get(url, headers=headers, timeout=15)

    if response.status_code == 200:
        items = response.json().get('items', [])
        # Return the minimal issue payload needed by the frontend and/or AI.
        return clean_issue_data(items)

    print(f"Failed to fetch open issues: {response.status_code} {response.text[:200]}")
    return []


def get_user_data(token):
    headers = {"Authorization": f"token {token}"}

    # 1. Get Profile (Bio, Name)
    user = requests.get("https://api.github.com/user", headers=headers).json()

    # 2. Get User Repos (to see their tech stack)
    repos = requests.get("https://api.github.com/user/repos?sort=updated", headers=headers).json()

    # 3. Get Issues assigned to them
    issues = requests.get("https://api.github.com/issues?filter=all", headers=headers).json()

    return {
        "username": user.get("login"),
        "bio": user.get("bio"),
        "tech_stack": list(set([r.get("language") for r in repos if r.get("language")])),
        "issues": issues[:5] # Last 5 active issues
    }