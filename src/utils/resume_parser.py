"""
Resume Parsing Utilities
Extract information from PDF and DOCX resumes
"""

import re
from typing import Optional
from datetime import datetime

# Try to import parsing libraries
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


class ResumeParser:
    """Parse resumes and extract structured information."""
    
    # Common tech skills
    TECH_SKILLS = [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin",
        "react", "vue", "angular", "svelte", "next.js", "node.js", "express", "django", "flask", "spring", "fastapi",
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb", "sqlite",
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "github actions", "gitlab ci",
        "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "data science",
        "html", "css", "sass", "tailwind", "bootstrap", "webpack", "vite",
        "rest api", "graphql", "microservices", "agile", "scrum", "ci/cd", "devops",
        "git", "linux", "sql", "nosql", "data analysis"
    ]
    
    # Common job titles
    JOB_TITLES = [
        "software engineer", "senior software engineer", "staff engineer", "principal engineer",
        "frontend developer", "backend developer", "full stack developer", "fullstack developer",
        "data scientist", "data analyst", "data engineer", "ml engineer", "machine learning engineer",
        "devops engineer", "sre", "site reliability engineer", "platform engineer", "cloud engineer",
        "product manager", "project manager", "engineering manager", "tech lead", "cto", "vp engineering",
        "ui/ux designer", "ux researcher", "product designer",
        "qa engineer", "test engineer", "automation engineer", "security engineer"
    ]
    
    def __init__(self):
        self.text = ""
    
    def parse_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file."""
        if not PDF_AVAILABLE:
            return ""
        
        try:
            import io
            reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            return f"Error parsing PDF: {str(e)}"
    
    def parse_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file."""
        if not DOCX_AVAILABLE:
            return ""
        
        try:
            import io
            doc = Document(io.BytesIO(file_content))
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            return f"Error parsing DOCX: {str(e)}"
    
    def extract_skills(self, text: str) -> list:
        """Extract skills from resume text."""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.TECH_SKILLS:
            if skill in text_lower:
                # Capitalize properly
                formatted = skill.title() if len(skill) > 3 else skill.upper()
                if skill == "c++":
                    formatted = "C++"
                elif skill == "c#":
                    formatted = "C#"
                found_skills.append(formatted)
        
        return list(set(found_skills))
    
    def extract_job_titles(self, text: str) -> list:
        """Extract job titles from resume text."""
        text_lower = text.lower()
        found_titles = []
        
        for title in self.JOB_TITLES:
            if title in text_lower:
                found_titles.append(title.title())
        
        return list(set(found_titles))
    
    def extract_experience_years(self, text: str) -> int:
        """Extract years of experience from resume text."""
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'experience[:\s]*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s*(?:in|of)\s*(?:software|development|engineering)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return int(match.group(1))
        
        # Estimate from date ranges
        year_pattern = r'20[0-2]\d'
        years = re.findall(year_pattern, text)
        if years:
            years = [int(y) for y in years]
            return max(years) - min(years)
        
        return 0
    
    def extract_education(self, text: str) -> list:
        """Extract education from resume text."""
        education = []
        text_lower = text.lower()
        
        degrees = [
            ("phd", "Ph.D."),
            ("doctorate", "Ph.D."),
            ("master's", "Master's"),
            ("masters", "Master's"),
            ("mba", "MBA"),
            ("m.s.", "M.S."),
            ("ms in", "M.S."),
            ("bachelor's", "Bachelor's"),
            ("bachelors", "Bachelor's"),
            ("b.s.", "B.S."),
            ("bs in", "B.S."),
            ("b.a.", "B.A."),
            ("ba in", "B.A."),
        ]
        
        fields = [
            "computer science", "software engineering", "information technology",
            "data science", "machine learning", "electrical engineering",
            "mathematics", "physics", "business administration", "economics"
        ]
        
        for key, degree in degrees:
            if key in text_lower:
                for field in fields:
                    if field in text_lower:
                        education.append(f"{degree} in {field.title()}")
                        break
                else:
                    education.append(degree)
        
        return list(set(education))
    
    def extract_email(self, text: str) -> Optional[str]:
        """Extract email from resume text."""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(email_pattern, text)
        return match.group(0) if match else None
    
    def extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number from resume text."""
        phone_patterns = [
            r'\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}',
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
        ]
        
        for pattern in phone_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return None
    
    def extract_linkedin(self, text: str) -> Optional[str]:
        """Extract LinkedIn URL from resume text."""
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        match = re.search(linkedin_pattern, text.lower())
        return f"https://{match.group(0)}" if match else None
    
    def extract_github(self, text: str) -> Optional[str]:
        """Extract GitHub URL from resume text."""
        github_pattern = r'github\.com/[\w-]+'
        match = re.search(github_pattern, text.lower())
        return f"https://{match.group(0)}" if match else None
    
    def parse(self, file_content: bytes, file_type: str) -> dict:
        """Parse resume and extract all information."""
        # Extract text based on file type
        if file_type.lower() == "pdf":
            text = self.parse_pdf(file_content)
        elif file_type.lower() in ["docx", "doc"]:
            text = self.parse_docx(file_content)
        else:
            # Try to decode as plain text
            try:
                text = file_content.decode("utf-8")
            except:
                text = ""
        
        self.text = text
        
        return {
            "skills": self.extract_skills(text),
            "jobTitles": self.extract_job_titles(text),
            "experienceYears": self.extract_experience_years(text),
            "education": self.extract_education(text),
            "email": self.extract_email(text),
            "phone": self.extract_phone(text),
            "linkedin": self.extract_linkedin(text),
            "github": self.extract_github(text),
            "rawTextLength": len(text)
        }


def parse_resume(file_content: bytes, file_type: str) -> dict:
    """Convenience function to parse a resume."""
    parser = ResumeParser()
    return parser.parse(file_content, file_type)
