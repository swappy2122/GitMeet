import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_pr_draft(issue_title, issue_body, user_match_reason):
    # Truncate long descriptions to speed up generation
    body_preview = (issue_body[:200] + "...") if len(issue_body) > 200 else issue_body
    
    prompt = f"""Draft a concise PR for this issue in Markdown:
Title: {issue_title}
Description: {body_preview}

Include only:
1. Summary (1-2 sentences)
2. Changes (3-4 bullets)
3. Testing (quick checklist)"""

    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                top_p=0.8,
                top_k=20,
                max_output_tokens=300,
            ),
        )
        return response.text
    except Exception as e:
        # Fallback to a template if API fails
        print(f"Error generating PR: {e}")
        return f"""# Pull Request

## Summary
Addressing issue: {issue_title}

## Changes
- Implemented fix for the issue
- Added relevant improvements
- Tested thoroughly

## Testing
- [ ] Manual testing completed
- [ ] No breaking changes
- [ ] Ready for review"""