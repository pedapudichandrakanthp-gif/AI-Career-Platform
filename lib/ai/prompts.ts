export const EXTRACT_PROFILE_PROMPT = `You are a resume parser. Extract structured profile information from the resume.
Return ONLY valid JSON with this exact shape (no markdown):
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "skills": ["skill1", "skill2"],
  "education": "string summary of education",
  "degree": "string highest degree",
  "experience": "string summary of work experience",
  "experience_years": number or null
}
Use empty strings for missing text fields, empty arrays for missing skills, null for unknown experience_years.`;

export const ANALYZE_RESUME_PROMPT = `You are an expert career coach. Analyze the resume and return ONLY valid JSON (no markdown):
{
  "resume_score": number between 0 and 100,
  "skills_found": ["skill1"],
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "missing_skills": ["skill that would improve the resume"],
  "recommendations": ["actionable recommendation"]
}`;

export const ANALYZE_JOB_PROMPT = `You are a job market analyst. Analyze the job posting and return ONLY valid JSON (no markdown):
{
  "required_skills": ["skill1"],
  "important_keywords": ["keyword1"],
  "difficulty_level": "Entry" | "Mid" | "Senior" | "Expert",
  "preparation_tips": ["tip1"],
  "interview_topics": ["topic1"]
}`;

export const IMPORT_JOB_PROMPT = `You are a job data extractor. Extract structured job listing data from the provided content.
Return ONLY valid JSON (no markdown):
{
  "title": "string",
  "company_name": "string",
  "location": "string",
  "job_type": "Full-time" | "Part-time" | "Contract" | "Remote" | "Internship" | string,
  "category": "string industry/category",
  "skills": ["skill1"],
  "qualification": "string",
  "experience_required": number or null,
  "description": "string full job description"
}
Use empty strings for missing text, empty arrays for missing skills, null for unknown experience_required.`;
