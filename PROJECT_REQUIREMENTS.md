\# AI Career Platform - Project Requirements Document (PRD)



\## Project Name



AI Career Platform



\## Project Vision



Build an AI-powered job recommendation platform that helps users discover the most relevant government and private jobs based on their education, skills, experience, location, and career goals.



The platform should act as an AI Career Assistant rather than a simple job board.



\---



\# Primary Goals



1\. Help users find relevant jobs quickly.

2\. Match jobs using AI instead of keyword search.

3\. Support both Government and Private jobs.

4\. Allow resume upload and automatic profile creation.

5\. Provide job match percentage scores.

6\. Enable easy job management through an admin panel.

7\. Launch a working MVP as quickly as possible.



\---



\# User Types



\## Job Seekers



\* Freshers

\* Experienced Professionals

\* Government Job Aspirants

\* Students



\## Admin



\* Add jobs

\* Edit jobs

\* Delete jobs

\* Manage users

\* Review platform statistics



\---



\# MVP Features (Version 1)



\## Authentication



\* User Registration

\* User Login

\* Forgot Password

\* Google Login



\---



\## User Profile



Fields:



\* Full Name

\* Email

\* Phone Number

\* Location

\* Education

\* Degree

\* Skills

\* Experience

\* Preferred Job Type

\* Expected Salary



\---



\## Resume Upload



User can upload:



\* PDF Resume

\* DOCX Resume



AI should extract:



\* Skills

\* Education

\* Experience

\* Certifications



Automatically populate user profile.



\---



\## Job Management



Each Job Contains:



\* Job Title

\* Company / Organization

\* Government or Private

\* Location

\* Salary

\* Qualification

\* Required Skills

\* Experience Required

\* Job Description

\* Application Link

\* Last Date To Apply

\* Category



\---



\## Job Categories



Government Jobs



\* UPSC

\* SSC

\* Railways

\* Banking

\* Defence

\* State Government



Private Jobs



\* Information Technology

\* Finance

\* Healthcare

\* Manufacturing

\* Sales

\* Marketing

\* Customer Support



\---



\## Job Search



Users can:



\* Search by keyword

\* Search by location

\* Search by skills

\* Search by qualification

\* Filter Government Jobs

\* Filter Private Jobs



\---



\## AI Matching System



AI compares:



User Profile



with



Job Requirements



Generate:



\* Match Percentage

\* Matching Skills

\* Missing Skills

\* Recommendation Score



Example:



Job Match = 92%



Matching Skills:



\* Java

\* Spring Boot

\* REST API



Missing Skills:



\* Docker

\* Kubernetes



\---



\## User Dashboard



Display:



\### Recommended Jobs



Top jobs sorted by AI score.



\### Recently Added Jobs



Latest jobs.



\### Saved Jobs



Jobs bookmarked by user.



\### Profile Completion



Percentage completed.



\---



\# Admin Panel



Admin Login



Admin Features:



\### Dashboard



\* Total Users

\* Total Jobs

\* Total Applications



\### Jobs



\* Add Job

\* Edit Job

\* Delete Job

\* Search Jobs



\### Users



\* View Users

\* View Profiles



\---



\# AI Features



\## Resume Analysis



Analyze uploaded resume.



Extract:



\* Skills

\* Education

\* Experience



\---



\## Job Matching



Compare:



User Profile



vs



Job Requirements



Generate:



\* Match Score

\* Missing Skills

\* Suggestions



\---



\## Career Suggestions



AI recommends:



\* Skills to learn

\* Certifications

\* Career paths



\---



\# Database Tables



\## Users



\* id

\* name

\* email

\* phone

\* education

\* degree

\* skills

\* experience

\* location

\* created\_at



\## Jobs



\* id

\* title

\* company

\* type

\* location

\* salary

\* qualification

\* skills\_required

\* experience\_required

\* description

\* apply\_link

\* last\_date

\* category

\* created\_at



\## Resumes



\* id

\* user\_id

\* resume\_url

\* parsed\_skills

\* parsed\_education

\* parsed\_experience



\## Saved Jobs



\* id

\* user\_id

\* job\_id



\## Match Scores



\* id

\* user\_id

\* job\_id

\* score

\* matching\_skills

\* missing\_skills



\---



\# Technology Stack



Frontend:



\* Next.js 15

\* TypeScript

\* Tailwind CSS



Backend:



\* Next.js API Routes



Database:



\* Supabase PostgreSQL



Authentication:



\* Supabase Auth



AI:



\* OpenAI API



Hosting:



\* Vercel



\---



\# UI Requirements



\* Mobile First

\* Responsive Design

\* Modern UI

\* Fast Loading

\* Dark Mode Support

\* SEO Friendly



\---



\# Future Features (Version 2)



\* AI Interview Preparation

\* Resume Builder

\* Cover Letter Generator

\* Job Alerts

\* Email Notifications

\* Recruiter Portal

\* Mobile Application



\---



\# Future Features (Version 3)



\* Employer Dashboard

\* AI Career Coach

\* Video Interview Practice

\* Salary Predictor

\* Skill Gap Analysis

\* Career Roadmaps



\---



\# Success Criteria



MVP is successful when:



\* Users can register.

\* Users can upload resumes.

\* Admin can add jobs.

\* AI generates match scores.

\* Users receive personalized job recommendations.

\* Platform works smoothly on mobile and desktop.



End of Document.



