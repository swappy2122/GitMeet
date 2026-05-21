import gspread
from oauth2client.service_account import ServiceAccountCredentials
import datetime

# Define the scope
SCOPE = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']

def log_match(user_skills, match_title, match_score):
    """Log match data to Google Sheets. Gracefully handles missing sheet."""
    try:
        # Authenticate
        creds = ServiceAccountCredentials.from_json_keyfile_name('service_account.json.json', SCOPE)
        client = gspread.authorize(creds)
        
        # Try to open the sheet by its name
        try:
            sheet = client.open("OSS Matchmaker Analytics").sheet1
        except gspread.exceptions.SpreadsheetNotFound:
            print(f"[SHEETS] Spreadsheet 'OSS Matchmaker Analytics' not found or inaccessible. Skipping logging.")
            return False
        
        # Prepare the row
        row = [
            str(datetime.datetime.now()), 
            user_skills, 
            match_title, 
            f"{match_score}%"
        ]
        
        sheet.append_row(row)
        print(f"[SHEETS] Logged match: {user_skills} - {match_title} ({match_score}%)")
        return True
        
    except Exception as e:
        print(f"[SHEETS] Error logging match: {e}")
        # Don't raise - allow the request to complete even if logging fails
        return False