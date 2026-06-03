\# AI Career Platform - Coding Rules



\## Purpose



These rules apply to all code generated for the AI Career Platform.



The goal is to maintain:



\* Clean Architecture

\* Scalability

\* Maintainability

\* Security

\* Performance

\* Mobile-First Design



All generated code must follow these standards.



\---



\# Core Principles



1\. Write production-ready code.

2\. Avoid shortcuts and hacks.

3\. Use TypeScript strictly.

4\. Keep code modular.

5\. Prefer reusable components.

6\. Follow clean architecture principles.

7\. Keep files small and focused.

8\. Use descriptive naming.

9\. Optimize for readability.

10\. Mobile-first development is mandatory.



\---



\# Technology Standards



Frontend



\* Next.js 15

\* TypeScript

\* Tailwind CSS



Backend



\* Next.js API Routes



Database



\* Supabase PostgreSQL



Authentication



\* Supabase Auth



AI



\* OpenAI API



Hosting



\* Vercel



\---



\# TypeScript Rules



Always use strict typing.



Never use:



any



Avoid:



unknown unless required.



Create interfaces for:



\* Users

\* Jobs

\* Resumes

\* Match Scores

\* API Responses



Example



interface User {

id: string

name: string

email: string

}



Use enums where appropriate.



\---



\# Folder Rules



Each feature must be isolated.



Correct:



components/jobs/



components/profile/



components/admin/



Incorrect:



components/misc/



components/all/



Do not create large mixed-purpose folders.



\---



\# File Naming Rules



Components



PascalCase



Example:



JobCard.tsx



UserProfile.tsx



AdminSidebar.tsx



Utilities



camelCase



Example:



calculateMatchScore.ts



extractResumeText.ts



API Routes



kebab-case



Example:



job-search



resume-upload



\---



\# Component Rules



Each component should have one responsibility.



Bad:



One component with 1000+ lines.



Good:



Separate components.



Example:



JobCard



JobList



JobFilters



JobDetails



Use composition over duplication.



\---



\# Responsive Design Rules



Mobile First



Design Order:



1\. Mobile

2\. Tablet

3\. Desktop



Every page must support:



320px



375px



768px



1024px



1440px



No horizontal scrolling.



No broken layouts.



No fixed-width containers.



\---



\# UI Rules



Design Style



Modern SaaS Platform



Requirements:



\* Clean Layout

\* Rounded Corners

\* Consistent Spacing

\* Accessible Forms

\* Fast Navigation



Support:



Light Mode



Dark Mode



Use reusable UI components.



\---



\# Form Rules



All forms require validation.



Validate:



\* Email

\* Password

\* Phone

\* URLs

\* Required Fields



Display friendly error messages.



Never allow invalid database submissions.



\---



\# API Rules



All APIs must return consistent responses.



Success Example



{

"success": true,

"data": {}

}



Error Example



{

"success": false,

"message": "Job not found"

}



Never expose internal errors.



Always use try/catch.



\---



\# Database Rules



Use migrations.



Never hardcode IDs.



Use UUIDs.



Create indexes for:



\* jobs

\* users

\* search fields



Avoid duplicate records.



Use foreign key relationships.



\---



\# Authentication Rules



Protected Routes



\* Dashboard

\* Profile

\* Saved Jobs

\* Resume Upload

\* Admin



Unauthenticated users must redirect to login.



Admin routes require role verification.



\---



\# Security Rules



Never expose:



OPENAI\_API\_KEY



SUPABASE\_SERVICE\_ROLE\_KEY



Database secrets



Store secrets only in environment variables.



Sanitize all inputs.



Validate uploaded files.



Prevent SQL injection.



Prevent XSS attacks.



Implement rate limiting.



\---



\# Resume Upload Rules



Allowed Formats



\* PDF

\* DOCX



Maximum File Size



10MB



Validate before upload.



Store files in Supabase Storage.



Never store files locally.



\---



\# AI Integration Rules



AI calls must be isolated.



Create:



lib/openai/



Do not place AI code inside UI components.



All AI requests go through API routes.



Cache AI results where possible.



Avoid duplicate AI requests.



\---



\# Job Matching Rules



Match Score Range



0 - 100



Factors



Skills Match



Education Match



Experience Match



Location Match



Salary Match



Return:



\* Match Score

\* Matching Skills

\* Missing Skills



Store results for future use.



\---



\# Performance Rules



Use:



Server Components where possible.



Lazy Loading



Pagination



Caching



Optimized Images



Avoid unnecessary re-renders.



Avoid large client-side bundles.



\---



\# Logging Rules



Log:



Authentication Events



Job Creation



Resume Uploads



AI Processing



Errors



Do not log:



Passwords



Tokens



API Keys



Sensitive User Data



\---



\# Error Handling Rules



Always provide user-friendly errors.



Example



Good:



"Resume upload failed. Please try again."



Bad:



"Unhandled exception at line 32"



Never expose stack traces.



\---



\# Accessibility Rules



Support:



Keyboard Navigation



Screen Readers



Proper Labels



ARIA Attributes



Sufficient Color Contrast



Accessible Forms



\---



\# Testing Rules



Write tests for:



Authentication



Job Creation



Resume Upload



AI Matching



API Endpoints



Critical User Flows



Target:



80%+ test coverage



\---



\# Deployment Rules



Before deployment:



Run TypeScript checks



Run lint checks



Run build checks



Run tests



Fix all warnings and errors.



Production build must be clean.



\---



\# Code Quality Rules



Maximum file size:



300 lines preferred



500 lines maximum



Maximum component responsibility:



Single feature only



Avoid duplicate code.



Refactor repeated logic into utilities.



\---



\# Definition of Done



A feature is complete only when:



\* Fully functional

\* Mobile responsive

\* Type-safe

\* Tested

\* Secure

\* Accessible

\* Documented

\* Production ready



No temporary code.



No TODO comments.



No placeholder implementations.



End of Coding Rules



