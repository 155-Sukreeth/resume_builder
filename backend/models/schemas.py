from pydantic import BaseModel
from typing import Dict, Any, List, Optional

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
