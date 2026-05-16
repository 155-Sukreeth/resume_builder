import os
import uuid
from playwright.sync_api import sync_playwright
from backend.core.config import EXPORTS_DIR

def generate_pdf(html_content: str) -> str:
    pdf_filename = os.path.join(EXPORTS_DIR, f"resume_{uuid.uuid4().hex[:8]}.pdf")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_content, wait_until="load")
        page.evaluate("document.fonts.ready")
        page.emulate_media(media="screen")
        page.pdf(path=pdf_filename, print_background=True, prefer_css_page_size=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
        browser.close()
        
    return pdf_filename
