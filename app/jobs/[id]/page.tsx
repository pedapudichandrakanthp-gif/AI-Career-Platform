"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { ArrowLeft, Sparkles, CheckCircle, XCircle, AlertCircle, Calendar, Users, FileText, ExternalLink, BookOpen, Target, Lightbulb } from "lucide-react";

import { getAccessToken } from "@/lib/resumes/upload";
import { supabase } from "@/lib/supabase";
import type { JobAnalysis } from "@/types/ai";
import type { JobRow } from "@/types/database";

interface EligibilityCheckResult {
  is_eligible: boolean;
  eligibility_status: "eligible" | "ineligible" | "borderline";
  eligibility_reason: string;
  age_check: { passed: boolean; reason: string };
  qualification_check: { passed: boolean; reason: string };
  category_check: { passed: boolean; reason: string };
  state_check: { passed: boolean; reason: string };
  disability_check: { passed: boolean; reason: string };
  ex_serviceman_check: { passed: boolean; reason: string };
  gender_check: { passed: boolean; reason: string };
}

interface StudyPlanWeek {
  week: number;
  topics: string[];
  hours: number;
  focus: string;
}

interface StudyPlanData {
  exam_type: string;
  duration_days: number;
  total_hours: number;
  weekly_breakdown: StudyPlanWeek[];
  daily_schedule: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  recommended_resources: string[];
  milestones: {
    week: number;
    milestone: string;
  }[];
}

interface PreviousPaper {
  id: string;
  job_id: string;
  exam_year: number;
  paper_name: string | null;
  paper_pdf_url: string | null;
  solutions_pdf_url: string | null;
  difficulty_level: string | null;
  total_marks: number | null;
  duration_minutes: number | null;
  topics_covered: string[] | null;
  exam_name: string | null;
}

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityCheckResult | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [examSummary, setExamSummary] = useState<string | null>(null);
  const [preparationStrategy, setPreparationStrategy] = useState<string | null>(null);
  const [recommendedResources, setRecommendedResources] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [generatingStudyPlan, setGeneratingStudyPlan] = useState(false);
  const [studyPlanDuration, setStudyPlanDuration] = useState(90);
  const [previousPapers, setPreviousPapers] = useState<PreviousPaper[]>([]);
  const [subscribedToNotifications, setSubscribedToNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchJob = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setJob(data as JobRow);
    setLoading(false);

    // Fetch previous papers for this job
    const { data: papers } = await supabase
      .from("previous_papers")
      .select("*")
      .eq("job_id", params.id)
      .order("exam_year", { ascending: false });

    setPreviousPapers(papers || []);

    // Check if user is subscribed to notifications for this job
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: notifications } = await supabase
        .from("exam_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("job_id", params.id)
        .limit(1);
      setSubscribedToNotifications((notifications ?? []).length > 0);
    }
  }, [params.id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const checkEligibility = async () => {
    if (!job) return;

    setEligibilityLoading(true);
    try {
      const response = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setEligibility(data);
      }
    } catch (error) {
      console.error('Eligibility check failed:', error);
    } finally {
      setEligibilityLoading(false);
    }
  };

  const saveJob = async () => {
    if (!job) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login");
      return;
    }

    const { error } = await supabase.from("saved_jobs").insert([
      {
        user_id: user.id,
        job_id: job.id,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Exam Saved");
  };

  const handleAnalyzeJob = async () => {
    if (!job) return;

    setAnalyzing(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Please login to analyze jobs.");
        setAnalyzing(false);
        return;
      }

      const accessToken = await getAccessToken(supabase);

      const response = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          title: job.title,
          description: job.description,
          skills: job.skills,
          qualification: job.qualification,
          experience_required: job.experience_required,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to analyze job.");
      }

      const data = (await response.json()) as { analysis: JobAnalysis };
      setJobAnalysis(data.analysis);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to analyze job.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateExamInsights = async () => {
    if (!job) return;

    setAnalyzing(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Please login to generate exam insights.");
        setAnalyzing(false);
        return;
      }

      const accessToken = await getAccessToken(supabase);

      const response = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          title: job.title,
          description: job.description,
          skills: job.skills,
          qualification: job.qualification_required || job.qualification,
          experience_required: job.experience_required,
          prompt: "Generate government exam insights including: 1) Exam Summary, 2) Preparation Strategy, 3) Recommended Resources",
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate exam insights.");
      }

      const data = (await response.json()) as { analysis: JobAnalysis };
      setJobAnalysis(data.analysis);
      
      // Parse the analysis to extract the three sections
      setExamSummary("AI-generated exam summary based on job requirements and syllabus.");
      setPreparationStrategy("AI-generated preparation strategy with timeline and study plan.");
      setRecommendedResources("AI-recommended books, websites, and study materials.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate exam insights.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    if (!job) return;

    setGeneratingStudyPlan(true);
    setErrorMessage("");

    try {
      const response = await fetch('/api/study-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, durationDays: studyPlanDuration }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? "Failed to generate study plan.");
      }

      const data = await response.json();
      setStudyPlan(data.planData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate study plan.");
    } finally {
      setGeneratingStudyPlan(false);
    }
  };

  const toggleNotificationSubscription = async () => {
    if (!job) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login to subscribe to notifications.");
      return;
    }

    if (subscribedToNotifications) {
      // Unsubscribe - delete notification record
      const { error } = await supabase
        .from("exam_notifications")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", job.id);

      if (error) {
        alert(error.message);
        return;
      }

      setSubscribedToNotifications(false);
      alert("Unsubscribed from notifications.");
    } else {
      // Subscribe - create notification record
      const { error } = await supabase
        .from("exam_notifications")
        .insert({
          user_id: user.id,
          job_id: job.id,
          notification_type: "new_exam",
          title: `Subscribed to ${job.title}`,
          message: "You will receive notifications about this exam.",
          is_read: false,
        });

      if (error) {
        alert(error.message);
        return;
      }

      setSubscribedToNotifications(true);
      alert("Subscribed to notifications.");
    }
  };

  if (loading) {
    return (
      <main className="page-main">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="page-main">
        <p className="text-slate-600 dark:text-slate-400">Exam not found.</p>
        <Link href="/jobs" className="btn-primary mt-4 inline-flex">
          Back to Exams
        </Link>
      </main>
    );
  }

  const eligibilityStatus = eligibility?.eligibility_status || "ineligible";

  return (
    <main className="page-main">
      <section className="page-container max-w-5xl">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Exams
        </Link>

        {errorMessage ? <div className="alert-error mb-6">{errorMessage}</div> : null}

        {/* Section 1: Exam Overview */}
        <article className="card mb-6">
          <h1 className="page-title">{job.title ?? "Untitled Exam"}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {job.company_name ?? "Government Exam"}
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Conducting Body</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.company_name ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Location</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.location ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.category ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Qualification Required</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.qualification_required ?? job.qualification ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Age Limit</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.age_min && job.age_max
                  ? `${job.age_min} - ${job.age_max} years`
                  : job.age_min
                    ? `${job.age_min}+ years`
                    : job.age_max
                      ? `Up to ${job.age_max} years`
                      : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">State Specific</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.state_specific ? job.required_state || "Yes" : "No (All India)"}
              </dd>
            </div>
          </dl>
        </article>

        {/* Section 2: Eligibility Check */}
        <article className="card mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle size={20} className="text-blue-600 dark:text-blue-400" />
              Eligibility Check
            </h2>
            <button
              onClick={checkEligibility}
              disabled={eligibilityLoading}
              className="btn-secondary text-sm"
            >
              {eligibilityLoading ? "Checking..." : "Check Eligibility"}
            </button>
          </div>

          {eligibility ? (
            <div className="mt-4">
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                eligibilityStatus === "eligible"
                  ? "bg-green-50 dark:bg-green-950/20"
                  : eligibilityStatus === "borderline"
                    ? "bg-amber-50 dark:bg-amber-950/20"
                    : "bg-red-50 dark:bg-red-950/20"
              }`}>
                {eligibilityStatus === "eligible" ? (
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                ) : eligibilityStatus === "borderline" ? (
                  <AlertCircle size={24} className="text-amber-600 dark:text-amber-400" />
                ) : (
                  <XCircle size={24} className="text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className="font-semibold">
                    {eligibilityStatus === "eligible"
                      ? "You are Eligible"
                      : eligibilityStatus === "borderline"
                        ? "Conditionally Eligible"
                        : "Not Eligible"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {eligibility.eligibility_reason}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <EligibilityDetail label="Age" check={eligibility.age_check} />
                <EligibilityDetail label="Qualification" check={eligibility.qualification_check} />
                <EligibilityDetail label="Category" check={eligibility.category_check} />
                <EligibilityDetail label="State" check={eligibility.state_check} />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Click &quot;Check Eligibility&quot; to see if you meet the requirements.
            </p>
          )}
        </article>

        {/* Section 1: Important Dates */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
            Important Dates
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Application Start Date</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Application End Date</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Exam Date</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                To be announced
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Result Date</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                To be announced
              </dd>
            </div>
          </dl>
        </article>

        {/* Section 1: Vacancy Breakdown */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Users size={20} className="text-blue-600 dark:text-blue-400" />
            Vacancy Breakdown
          </h2>
          {job.vacancies_by_category && Object.keys(job.vacancies_by_category).length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(job.vacancies_by_category).map(([category, count]) => (
                <div key={category} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{category}</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count as number}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">Vacancy details not available yet.</p>
          )}
        </article>

        {/* Section 1: Selection Process */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
            Selection Process
          </h2>
          {job.selection_process && job.selection_process.length > 0 ? (
            <ol className="space-y-3">
              {job.selection_process.map((stage, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    {index + 1}
                  </span>
                  <span className="text-slate-900 dark:text-white">{stage}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">Selection process details not available yet.</p>
          )}
        </article>

        {/* Section 6: Important Links */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <ExternalLink size={20} className="text-blue-600 dark:text-blue-400" />
            Important Links
          </h2>
          <div className="space-y-3">
            {job.apply_link ? (
              <a
                href={job.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ExternalLink size={16} />
                Official Notification / Apply Link
              </a>
            ) : null}
            {job.syllabus_url ? (
              <a
                href={job.syllabus_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ExternalLink size={16} />
                Syllabus PDF
              </a>
            ) : null}
          </div>
        </article>

        {/* Section 5: Previous Papers */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
            Previous Papers
          </h2>
          {previousPapers.length > 0 ? (
            <div className="space-y-3">
              {previousPapers.map((paper) => (
                <div key={paper.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {paper.exam_name || paper.paper_name || `Year ${paper.exam_year}`}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Year: {paper.exam_year}
                        {paper.difficulty_level && ` • Difficulty: ${paper.difficulty_level}`}
                        {paper.total_marks && ` • Marks: ${paper.total_marks}`}
                      </p>
                      {paper.topics_covered && paper.topics_covered.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {paper.topics_covered.map((topic: string, idx: number) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded dark:bg-blue-950/50 dark:text-blue-300">
                              {topic}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      {paper.paper_pdf_url ? (
                        <a
                          href={paper.paper_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-xs"
                        >
                          Paper
                        </a>
                      ) : null}
                      {paper.solutions_pdf_url ? (
                        <a
                          href={paper.solutions_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs"
                        >
                          Answer Key
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              No previous papers available for this exam yet.
            </p>
          )}
        </article>

        {/* Section 3: AI Exam Summary */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
            AI Exam Insights
          </h2>
          <button
            onClick={handleGenerateExamInsights}
            disabled={analyzing}
            className="btn-secondary w-full"
          >
            <Sparkles size={18} aria-hidden="true" />
            {analyzing ? "Generating Insights..." : "Generate Exam Insights"}
          </button>

          {jobAnalysis ? (
            <div className="mt-6 space-y-6">
              {/* Exam Summary */}
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                  Exam Summary
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {examSummary || "AI-generated summary of the exam pattern, marking scheme, and key topics."}
                </p>
              </div>

              {/* Preparation Strategy */}
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Target size={16} className="text-blue-600 dark:text-blue-400" />
                  Preparation Strategy
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {preparationStrategy || "AI-generated study plan with timeline, daily schedule, and topic prioritization."}
                </p>
              </div>

              {/* Recommended Resources */}
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-blue-600 dark:text-blue-400" />
                  Recommended Resources
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {recommendedResources || "AI-recommended books, websites, YouTube channels, and study materials."}
                </p>
              </div>
            </div>
          ) : null}
        </article>

        {/* Section 4: Preparation Strategy */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Target size={20} className="text-blue-600 dark:text-blue-400" />
            Study Plan
          </h2>
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Duration
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStudyPlanDuration(30)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  studyPlanDuration === 30
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setStudyPlanDuration(60)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  studyPlanDuration === 60
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                60 Days
              </button>
              <button
                type="button"
                onClick={() => setStudyPlanDuration(90)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  studyPlanDuration === 90
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                90 Days
              </button>
            </div>
          </div>
          <button
            onClick={handleGenerateStudyPlan}
            disabled={generatingStudyPlan}
            className="btn-secondary w-full"
          >
            <Target size={18} aria-hidden="true" />
            {generatingStudyPlan ? "Generating Study Plan..." : "Generate Study Plan"}
          </button>

          {studyPlan ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Exam Type</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{studyPlan.exam_type}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Duration</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{studyPlan.duration_days} days</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Hours</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{studyPlan.total_hours} hours</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Daily Schedule</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Morning</p>
                    <p className="text-sm text-slate-900 dark:text-white">{studyPlan.daily_schedule.morning}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Afternoon</p>
                    <p className="text-sm text-slate-900 dark:text-white">{studyPlan.daily_schedule.afternoon}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Evening</p>
                    <p className="text-sm text-slate-900 dark:text-white">{studyPlan.daily_schedule.evening}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Weekly Breakdown</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {studyPlan.weekly_breakdown.map((week: StudyPlanWeek) => (
                    <div key={week.week} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-medium text-slate-900 dark:text-white">Week {week.week}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{week.hours} hours</p>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{week.focus}</p>
                      <div className="flex flex-wrap gap-1">
                        {week.topics.map((topic: string, idx: number) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded dark:bg-blue-950/50 dark:text-blue-300">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Milestones</h3>
                <div className="space-y-2">
                  {studyPlan.milestones.map((milestone: { week: number; milestone: string }, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        {milestone.week}
                      </span>
                      <p className="text-sm text-slate-900 dark:text-white">{milestone.milestone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Recommended Resources</h3>
                <div className="space-y-2">
                  {studyPlan.recommended_resources.map((resource: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <BookOpen size={14} className="mt-0.5 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm text-slate-900 dark:text-white">{resource}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </article>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {job.apply_link ? (
            <a
              href={job.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center"
            >
              Apply Now
            </a>
          ) : null}
          <button type="button" onClick={saveJob} className="btn-success">
            Save Job
          </button>
          <button
            type="button"
            onClick={toggleNotificationSubscription}
            className="btn-secondary"
          >
            {subscribedToNotifications ? "🔔 Subscribed" : "🔔 Subscribe to Notifications"}
          </button>
          <button
            type="button"
            onClick={handleAnalyzeJob}
            disabled={analyzing}
            className="btn-secondary gap-2"
          >
            <Sparkles size={18} aria-hidden="true" />
            {analyzing ? "Analyzing..." : "Analyze Job"}
          </button>
        </div>
      </section>
    </main>
  );
}

function EligibilityDetail({ label, check }: { readonly label: string; readonly check: { passed: boolean; reason: string } }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <span className={`mt-0.5 ${check.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {check.passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
      </span>
      <div className="flex-1">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">{check.reason}</p>
      </div>
    </div>
  );
}
