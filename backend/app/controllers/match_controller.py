from app.services.github_service import fetch_open_issues
from app.services.gemini_service import get_ai_matches
from app.services.sheets_service import log_match
from fastapi import BackgroundTasks

async def handle_matching(user_skills, language, token=None, background_tasks: BackgroundTasks = None):
    print("Step 1: Fetching issues from GitHub...")
    # NOTE: Fix parameter to fetch_open_issues 
    query = f"label:\"good first issue\" language:{language} state:open"
    raw_issues = fetch_open_issues(query, token=token, limit=6)
    print(f"Fetched {len(raw_issues)} issues.")

    print("Step 2: Sending data to Gemini (this takes 10-15s)...")
    matches = get_ai_matches(user_skills, raw_issues)
    print("Step 3: Gemini finished!")

    # Log to Google Sheets asynchronously so it doesn't block the response
    if matches and background_tasks:
        try:
            background_tasks.add_task(log_match, user_skills, matches[0]['title'], matches[0]['match_score'])
        except Exception as e:
            print(f"Failed to queue match logging: {e}")

    return matches