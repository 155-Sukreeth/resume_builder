from jinja2 import Environment, FileSystemLoader
from backend.models.schemas import ResumeData

env = Environment(loader=FileSystemLoader("backend/templates"))

def format_desc(text: str) -> str:
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

def process_data_for_template(data: ResumeData) -> dict:
    d = data.dict()
    # Format descriptions
    for sec_name, items in d.get("sections", {}).items():
        for item in items:
            if "desc" in item and item["desc"]:
                item["desc"] = format_desc(item["desc"])
    return d

def render_resume_html(data: ResumeData) -> str:
    template = env.get_template("resume.html")
    context = process_data_for_template(data)
    return template.render(**context)
