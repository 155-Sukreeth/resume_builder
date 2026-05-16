import os
import json
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
from playwright.sync_api import sync_playwright
import uuid

app = FastAPI()

@app.get("/")
def read_root():
    return RedirectResponse(url="/frontend/index.html")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

DRAFTS_DIR = "drafts"
DRAFT_FILE = os.path.join(DRAFTS_DIR, "resume_draft.json")

# Jinja2 setup
env = Environment(loader=FileSystemLoader("templates"))

# Helper for description formatting
def format_desc(text):
    if not text:
        return ""
    lines = text.split('\n')
    html = ""
    in_list = False
    
    for line in lines:
        trimmed = line.strip()
        if trimmed.startswith('-'):
            if not in_list:
                html += '<ul>'
                in_list = True
            html += f"<li>{trimmed[1:].strip()}</li>"
        else:
            if in_list:
                html += '</ul>'
                in_list = False
            if trimmed:
                html += f"<p>{trimmed}</p>"
    
    if in_list:
        html += '</ul>'
    return html

env.filters['format_desc'] = format_desc

class ResumeData(BaseModel):
    photo: Optional[str] = ""
    name: Optional[str] = ""
    title: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    linkedin: Optional[str] = ""
    location: Optional[str] = ""
    summary: Optional[str] = ""
    skills: Optional[str] = ""
    sections: Dict[str, List[Dict[str, Any]]] = {}

def process_data_for_template(data: ResumeData) -> dict:
    d = data.dict()
    # Format descriptions
    for sec_name, items in d.get("sections", {}).items():
        for item in items:
            if "desc" in item and item["desc"]:
                item["desc"] = format_desc(item["desc"])
    return d

@app.get("/api/draft")
def get_draft():
    if os.path.exists(DRAFT_FILE):
        with open(DRAFT_FILE, 'r', encoding='utf-8') as f:
            return json.loads(f.read())
    return {}

@app.post("/api/draft")
def save_draft(data: dict):
    if not os.path.exists(DRAFTS_DIR):
        os.makedirs(DRAFTS_DIR)
    with open(DRAFT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    return {"status": "success"}

@app.post("/api/render")
def render_template(data: ResumeData):
    template = env.get_template("resume.html")
    context = process_data_for_template(data)
    html_content = template.render(**context)
    return HTMLResponse(content=html_content)

@app.post("/api/export")
def export_pdf(data: ResumeData):
    template = env.get_template("resume.html")
    context = process_data_for_template(data)
    html_content = template.render(**context)
    
    if not os.path.exists("exports"):
        os.makedirs("exports")
        
    pdf_filename = f"exports/resume_{uuid.uuid4().hex[:8]}.pdf"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_content, wait_until="load")
        page.evaluate("document.fonts.ready")
        page.emulate_media(media="screen")
        page.pdf(path=pdf_filename, print_background=True, prefer_css_page_size=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
        browser.close()
        
    return FileResponse(path=pdf_filename, filename="resume.pdf", media_type="application/pdf")

if __name__ == '__main__':
    print("Serving at http://localhost:8000/frontend/index.html", flush=True)
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
