import os

DRAFTS_DIR = os.path.join("data", "drafts")
DRAFT_FILE = os.path.join(DRAFTS_DIR, "resume_draft.json")
EXPORTS_DIR = os.path.join("data", "exports")

# Ensure directories exist
os.makedirs(DRAFTS_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)
