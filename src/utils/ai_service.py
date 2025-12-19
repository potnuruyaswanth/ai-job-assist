"""
AI Service Utilities
Integration with OpenAI and Google Gemini APIs
"""

import os
from typing import Optional

# Try to import AI libraries
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class AIService:
    """Unified AI service for generating content."""
    
    def __init__(self):
        self.provider = self._detect_provider()
        self._setup_client()
    
    def _detect_provider(self) -> str:
        """Detect which AI provider to use based on available API keys."""
        if os.getenv("OPENAI_API_KEY"):
            return "openai"
        elif os.getenv("GEMINI_API_KEY"):
            return "gemini"
        return "mock"
    
    def _setup_client(self):
        """Set up the AI client."""
        if self.provider == "openai" and OPENAI_AVAILABLE:
            self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        elif self.provider == "gemini" and GEMINI_AVAILABLE:
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            self.client = genai.GenerativeModel("gemini-pro")
        else:
            self.client = None
    
    async def generate_text(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate text using the configured AI provider."""
        if self.provider == "openai" and self.client:
            return await self._generate_openai(prompt, max_tokens)
        elif self.provider == "gemini" and self.client:
            return await self._generate_gemini(prompt, max_tokens)
        else:
            return self._generate_mock(prompt)
    
    async def _generate_openai(self, prompt: str, max_tokens: int) -> str:
        """Generate text using OpenAI."""
        try:
            response = self.client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4"),
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating content: {str(e)}"
    
    async def _generate_gemini(self, prompt: str, max_tokens: int) -> str:
        """Generate text using Google Gemini."""
        try:
            response = self.client.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating content: {str(e)}"
    
    def _generate_mock(self, prompt: str) -> str:
        """Generate mock content for testing."""
        if "cover letter" in prompt.lower():
            return self._mock_cover_letter()
        elif "social" in prompt.lower() or "post" in prompt.lower():
            return self._mock_social_post()
        elif "match" in prompt.lower():
            return '{"score": 75, "matchingAreas": ["Python", "JavaScript"], "recommendation": "Good fit"}'
        return "Generated content placeholder"
    
    def _mock_cover_letter(self) -> str:
        return """Dear Hiring Manager,

I am excited to apply for this position. With my background in software development 
and passion for innovation, I believe I would be a valuable addition to your team.

Throughout my career, I have developed strong technical skills and the ability to 
collaborate effectively with cross-functional teams. I am eager to bring my expertise 
to your organization.

Thank you for considering my application.

Best regards"""
    
    def _mock_social_post(self) -> str:
        return "🚀 Excited to share this update! Building amazing things every day. #Tech #Innovation #Growth"


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get or create the AI service singleton."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service


async def generate_social_post(topic: str, tone: str, platform: str, hashtag_count: int = 3) -> str:
    """Generate a social media post."""
    service = get_ai_service()
    
    prompt = f"""Write a {platform} post about: {topic}
Tone: {tone}
Include {hashtag_count} relevant hashtags.
Keep it engaging and shareable."""
    
    return await service.generate_text(prompt, max_tokens=300)


async def generate_cover_letter(
    name: str,
    job_title: str,
    company: str,
    skills: list,
    experience_years: int,
    custom_instructions: str = None
) -> str:
    """Generate a cover letter."""
    service = get_ai_service()
    
    prompt = f"""Write a professional cover letter for:
Name: {name}
Position: {job_title} at {company}
Skills: {', '.join(skills)}
Experience: {experience_years} years

Keep it professional, personable, and under 400 words."""
    
    if custom_instructions:
        prompt += f"\n\nAdditional notes: {custom_instructions}"
    
    return await service.generate_text(prompt, max_tokens=600)


async def calculate_job_match(resume_skills: list, job_requirements: list) -> dict:
    """Calculate job match score using AI."""
    service = get_ai_service()
    
    prompt = f"""Compare these resume skills with job requirements and provide a match analysis.

Resume Skills: {', '.join(resume_skills)}
Job Requirements: {', '.join(job_requirements)}

Return a JSON object with:
- score: number (0-100)
- matchingSkills: array of matching skills
- missingSkills: array of skills to develop
- recommendation: brief advice"""
    
    response = await service.generate_text(prompt, max_tokens=300)
    
    # Try to parse as JSON, fallback to default
    try:
        import json
        return json.loads(response)
    except:
        # Calculate basic match
        matching = [s for s in resume_skills if any(r.lower() in s.lower() for r in job_requirements)]
        missing = [r for r in job_requirements if not any(s.lower() in r.lower() for s in resume_skills)]
        score = int((len(matching) / max(len(job_requirements), 1)) * 100)
        
        return {
            "score": score,
            "matchingSkills": matching,
            "missingSkills": missing,
            "recommendation": "Good potential match" if score >= 60 else "Consider upskilling"
        }
