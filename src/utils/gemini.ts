/**
 * Gemini AI Service for Job Application Assistant
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export async function generateCoverLetter(
  jobTitle: string,
  company: string,
  jobDescription: string,
  userProfile: {
    name: string;
    skills: string[];
    experienceYears: number;
    preferredRoles: string[];
  },
  customMessage?: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return generateFallbackCoverLetter(jobTitle, company, userProfile);
  }

  const prompt = `Generate a professional cover letter for a job application.

Job Details:
- Position: ${jobTitle}
- Company: ${company}
- Description: ${jobDescription}

Candidate Profile:
- Name: ${userProfile.name}
- Skills: ${userProfile.skills.join(', ')}
- Experience: ${userProfile.experienceYears} years
- Preferred Roles: ${userProfile.preferredRoles.join(', ')}
${customMessage ? `\nAdditional Notes from Candidate: ${customMessage}` : ''}

Write a compelling, personalized cover letter that:
1. Opens with enthusiasm for the specific role
2. Highlights relevant skills and experience
3. Shows knowledge of the company
4. Explains why the candidate is a great fit
5. Ends with a strong call to action

Keep it concise (about 300-400 words) and professional.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return generateFallbackCoverLetter(jobTitle, company, userProfile);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || generateFallbackCoverLetter(jobTitle, company, userProfile);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateFallbackCoverLetter(jobTitle, company, userProfile);
  }
}

export async function analyzeJobMatch(
  jobDescription: string,
  userSkills: string[],
  userExperience: number
): Promise<{ score: number; reasons: string[] }> {
  if (!GEMINI_API_KEY) {
    return calculateFallbackMatchScore(userSkills);
  }

  const prompt = `Analyze how well this candidate matches the job.

Job Description:
${jobDescription}

Candidate:
- Skills: ${userSkills.join(', ')}
- Experience: ${userExperience} years

Respond in JSON format only:
{
  "score": <number 0-100>,
  "reasons": ["reason1", "reason2", "reason3"]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      return calculateFallbackMatchScore(userSkills);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return calculateFallbackMatchScore(userSkills);
  } catch (error) {
    console.error('Error analyzing job match:', error);
    return calculateFallbackMatchScore(userSkills);
  }
}

function generateFallbackCoverLetter(
  jobTitle: string,
  company: string,
  userProfile: { name: string; skills: string[]; experienceYears: number }
): string {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With ${userProfile.experienceYears} years of experience and expertise in ${userProfile.skills.slice(0, 3).join(', ')}, I am confident in my ability to make a meaningful contribution to your team.

Throughout my career, I have developed a comprehensive skill set that includes ${userProfile.skills.join(', ')}. These skills, combined with my passion for delivering high-quality work, make me an ideal candidate for this role.

I am particularly drawn to ${company} because of its reputation for innovation and excellence. I am excited about the opportunity to bring my experience and enthusiasm to your team.

I would welcome the opportunity to discuss how my background and skills would be a great fit for this position. Thank you for considering my application.

Best regards,
${userProfile.name}`;
}

function calculateFallbackMatchScore(userSkills: string[]): { score: number; reasons: string[] } {
  const commonTechSkills = ['javascript', 'python', 'react', 'node.js', 'typescript', 'aws', 'docker', 'sql'];
  const matchingSkills = userSkills.filter(skill => 
    commonTechSkills.some(tech => skill.toLowerCase().includes(tech))
  );
  
  const score = Math.min(95, 50 + (matchingSkills.length * 10));
  
  return {
    score,
    reasons: [
      `Has ${userSkills.length} relevant skills`,
      matchingSkills.length > 0 ? `Strong in: ${matchingSkills.slice(0, 3).join(', ')}` : 'Diverse skill set',
      'Profile appears complete'
    ]
  };
}
