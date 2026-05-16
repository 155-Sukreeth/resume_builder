import os
import json
from fastapi import APIRouter
from fastapi.responses import HTMLResponse, FileResponse
from backend.models.schemas import ResumeData
from backend.services.template_engine import render_resume_html
from backend.services.pdf_service import generate_pdf
from backend.core.config import DRAFT_FILE, DRAFTS_DIR

router = APIRouter()

@router.get("/draft")
def get_draft():
    if os.path.exists(DRAFT_FILE):
        with open(DRAFT_FILE, 'r', encoding='utf-8') as f:
            return json.loads(f.read())
    return {}

@router.post("/draft")
def save_draft(data: dict):
    if not os.path.exists(DRAFTS_DIR):
        os.makedirs(DRAFTS_DIR)
    with open(DRAFT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    return {"status": "success"}

@router.post("/render")
def render_template(data: ResumeData):
    html_content = render_resume_html(data)
    return HTMLResponse(content=html_content)

@router.post("/export")
def export_pdf(data: ResumeData):
    html_content = render_resume_html(data)
    pdf_path = generate_pdf(html_content)
    return FileResponse(path=pdf_path, filename="resume.pdf", media_type="application/pdf")
