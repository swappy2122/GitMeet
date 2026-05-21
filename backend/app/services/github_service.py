import requests
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}


def clean_issue_data(raw_issues):
    """Token guillotine: keep only the absolute essentials for AI matching."""
    cleaned = []
    for i in (raw_issues or [])[:6]:
        repo_url = i.get("repository_url", "")
        repo_name = repo_url.replace("https://api.github.com/repos/", "") if repo_url else "unknown"
        
        cleaned.append({
            "title": i.get("title"),
            "repo": repo_name,
            "url": i.get("html_url") or i.get("url"),
            "labels": [l.get("name") for l in i.get("labels", []) if isinstance(l, dict) and l.get("name")],
            "body": (i.get("body") or "")[:150],
        })
    
    return cleaned


def fetch_open_issues(query="label:\"good first issue\" state:open", token=None, limit=10):
    # Prefer the user's token so search results reflect their GitHub access.
    headers = {"Authorization": f"token {token}"} if token else HEADERS
    
    print(f"Attempting to fetch issues with query: {query}")
    
    # Try the original query first
    try:
        # Use params parameter for proper URL encoding
        response = requests.get(
            "https://api.github.com/search/issues",
            params={
                "q": query,
                "per_page": limit,
                "sort": "updated",
                "order": "desc"
            },
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            items = response.json().get('items', [])
            print(f"Found {len(items)} issues")
            if items:
                return clean_issue_data(items)
        
        print(f"GitHub search API returned {response.status_code}")
        if response.status_code >= 400:
            print(f"API Error: {response.text[:300]}")
        
        # If search API fails or returns nothing, try public issues
        print("Search API returned no results, trying public issues...")
        response2 = requests.get(
            "https://api.github.com/issues",
            params={
                "state": "open",
                "labels": "good-first-issue",
                "per_page": limit,
                "sort": "updated"
            },
            headers=headers,
            timeout=15
        )
        
        if response2.status_code == 200:
            items = response2.json()
            print(f"Found {len(items)} public issues with label")
            if items:
                return clean_issue_data(items)
        
        return []
    except Exception as e:
        print(f"Error fetching issues: {e}")
        import traceback
        traceback.print_exc()
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


# Popular repos known to have "good first issue" labels
POPULAR_REPOS = [
    "facebook/react",
    "vuejs/vue",
    "angular/angular",
    "nodejs/node",
    "microsoft/vscode",
    "kubernetes/kubernetes",
    "docker/docker",
    "tensorflow/tensorflow",
    "pytorch/pytorch",
    "torvalds/linux"
]

def fetch_from_popular_repos(label="good first issue", limit=10, token=None):
    """Fallback: fetch issues from popular repos"""
    print(f"[GITHUB] fetch_from_popular_repos called with label={label}, limit={limit}, token={'SET' if token else 'NONE'}")
    
    # Use token if provided and valid, otherwise skip auth
    headers = {"Authorization": f"token {token}"} if token else {}
    all_issues = []
    
    for repo in POPULAR_REPOS[:3]:  # Try first 3 popular repos
        try:
            url = f"https://api.github.com/repos/{repo}/issues"
            print(f"[GITHUB] Fetching {url} with headers={bool(headers)}")
            response = requests.get(
                url,
                params={
                    "labels": label,
                    "state": "open",
                    "per_page": 3
                },
                headers=headers,
                timeout=10
            )
            
            print(f"[GITHUB] Status {response.status_code} from {repo}")
            if response.status_code == 200:
                issues = response.json()
                print(f"[GITHUB] Got {len(issues)} issues from {repo}")
                all_issues.extend(issues)
                if len(all_issues) >= limit:
                    break
            elif response.status_code == 401 and headers:
                # Token might be invalid, retry without it
                print(f"[GITHUB] 401 error, retrying {repo} without token")
                response = requests.get(
                    url,
                    params={
                        "labels": label,
                        "state": "open",
                        "per_page": 3
                    },
                    headers={},
                    timeout=10
                )
                if response.status_code == 200:
                    issues = response.json()
                    print(f"[GITHUB] Got {len(issues)} issues from {repo} (no auth)")
                    all_issues.extend(issues)
                    if len(all_issues) >= limit:
                        break
        except Exception as e:
            print(f"[GITHUB] Error fetching from {repo}: {e}")
            continue
    
    print(f"[GITHUB] Total raw issues: {len(all_issues)}")
    if all_issues:
        result = clean_issue_data(all_issues)
        print(f"[GITHUB] Returning {len(result)} cleaned issues")
        return result
    else:
        print(f"[GITHUB] No issues found, returning empty list")
        return []