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
  "experience_years": number or null,
  "certifications": ["cert1"],
  "projects": "string summary of projects"
}
Use empty strings for missing text fields, empty arrays for missing arrays, null for unknown experience_years.`;

export const ANALYZE_RESUME_PROMPT = `You are an expert ATS and career coach. Analyze the resume and return ONLY valid JSON (no markdown):
{
  "ats_score": number between 0 and 100,
  "resume_strength": number between 0 and 100,
  "skills_found": ["skill1"],
  "missing_skills": ["skill1"],
  "missing_keywords": ["keyword1"],
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "suggestions": ["improvement1"],
  "recommended_certifications": ["cert1"],
  "recommended_skills": ["skill1"]
}`;

export const ANALYZE_JOB_PROMPT = `You are a job market analyst. Analyze the job posting and compare with the candidate resume if provided.
Return ONLY valid JSON (no markdown):
{
  "required_skills": ["skill1"],
  "preferred_skills": ["skill1"],
  "experience_needed": "string",
  "responsibilities": ["resp1"],
  "important_keywords": ["keyword1"],
  "difficulty_level": "Entry" | "Mid" | "Senior" | "Expert",
  "preparation_tips": ["tip1"],
  "interview_topics": ["topic1"],
  "match_score": number between 0 and 100,
  "missing_skills": ["skill1"]
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
}`;

export const CLEAN_JOB_PROMPT = `You are a job data normalizer. Clean and normalize raw job posting data.
Return ONLY valid JSON (no markdown):
{
  "clean_title": "normalized concise title",
  "title": "professional job title",
  "company_name": "string",
  "location": "string",
  "job_type": "Full-time" | "Part-time" | "Contract" | "Internship",
  "work_mode": "Remote" | "Hybrid" | "Onsite",
  "category": "string industry/category",
  "skills": ["skill1"],
  "experience_required": number or null,
  "qualification": "string",
  "description": "cleaned description",
  "summary": "2-3 sentence summary"
}`;

export const CAREER_ROADMAP_PROMPT = `You are a career coach. Generate a career roadmap based on the user's profile and target role.
Return ONLY valid JSON (no markdown):
{
  "target_role": "string",
  "current_skills": ["skill1"],
  "recommended_skills": ["skill1"],
  "courses": ["course1"],
  "certifications": ["cert1"],
  "milestones": ["milestone1"]
}`;
