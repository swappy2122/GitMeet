from app.services.github_service import fetch_open_issues
from app.services.gemini_service import get_ai_matches
from app.services.sheets_service import log_match
from fastapi import BackgroundTasks

async def handle_matching(user_skills, language, token=None, background_tasks: BackgroundTasks = None):
    print(f"Fetching GitHub issues for skill: {user_skills}", flush=True)
    
    # Try popular repos first - most reliable
    print("Fetching from popular repos...", flush=True)
    from app.services.github_service import fetch_from_popular_repos
    raw_issues = fetch_from_popular_repos(label="good first issue", limit=10, token=token)
    print(f"Got {len(raw_issues) if raw_issues else 0} issues from popular repos", flush=True)
    if raw_issues:
        print(f"Got {len(raw_issues)} issues from popular repos")
        matches = []
        for idx, issue in enumerate(raw_issues[:5]):
            matches.append({
                "title": issue.get("title"),
                "url": issue.get("url"),
                "repo": issue.get("repo"),
                "match_score": max(50, 85 - (idx * 8)),
                "reason": f"Good first issue on GitHub"
            })
        
        # Log to Google Sheets asynchronously
        if matches and background_tasks:
            try:
                background_tasks.add_task(log_match, user_skills, matches[0]['title'], matches[0]['match_score'])
            except Exception as e:
                print(f"Failed to queue match logging: {e}")
        
        return matches
    
    # Fallback: use themed mock data if GitHub returns nothing
    print("GitHub search returned no results, using fallback data")
    fallback_data = {
        "ai": [
            {"title": "Add machine learning model integration", "url": "https://github.com/example/ai-project/issues/1", "repo": "example/ai-project", "match_score": 85, "reason": "AI/ML related"},
            {"title": "Implement NLP preprocessing pipeline", "url": "https://github.com/example/nlp-lib/issues/2", "repo": "example/nlp-lib", "match_score": 78, "reason": "Natural language processing"},
            {"title": "Create data visualization dashboard", "url": "https://github.com/example/data-viz/issues/3", "repo": "example/data-viz", "match_score": 72, "reason": "Data analysis"}
        ],
        "infra": [
            {"title": "Set up Docker containerization", "url": "https://github.com/example/infra-tools/issues/1", "repo": "example/infra-tools", "match_score": 88, "reason": "Infrastructure"},
            {"title": "Configure CI/CD pipeline", "url": "https://github.com/example/devops/issues/2", "repo": "example/devops", "match_score": 82, "reason": "DevOps related"},
            {"title": "Implement Kubernetes deployment", "url": "https://github.com/example/k8s-config/issues/3", "repo": "example/k8s-config", "match_score": 75, "reason": "Cloud infrastructure"}
        ],
        "frontend": [
            {"title": "Build responsive UI components", "url": "https://github.com/example/ui-lib/issues/1", "repo": "example/ui-lib", "match_score": 86, "reason": "Frontend development"},
            {"title": "Implement dark mode theme", "url": "https://github.com/example/web-app/issues/2", "repo": "example/web-app", "match_score": 80, "reason": "UI/UX"},
            {"title": "Optimize React component performance", "url": "https://github.com/example/react-app/issues/3", "repo": "example/react-app", "match_score": 73, "reason": "Frontend optimization"}
        ]
    }
    
    matches = fallback_data.get(user_skills, fallback_data["ai"])

    # Log to Google Sheets asynchronously
    if matches and background_tasks:
        try:
            background_tasks.add_task(log_match, user_skills, matches[0]['title'], matches[0]['match_score'])
        except Exception as e:
            print(f"Failed to queue match logging: {e}")

    return matches