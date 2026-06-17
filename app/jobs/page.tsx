import { Suspense } from "react";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ArrowLeft, Bookmark, Briefcase, Calendar, CheckCircle2, ChevronDown, ChevronUp, Download, ExternalLink, GraduationCap, IndianRupee, Lock, MapPin, Sparkles, XCircle } from "lucide-react";

const getStatusBadge = (status?: string | null) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "open": return <span className="badge-green">Open</span>;
    case "closing_soon": return <span className="badge-yellow animate-pulse">Closing Soon</span>;
    case "upcoming": return <span className="badge-blue">Upcoming</span>;
    case "closed": return <span className="badge-red">Closed</span>;
    default: return null;
  }
};

const formatDate = (dateString?: string | null) => dateString ? new Date(dateString).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "TBD";

async function JobsList() {
  // Silently call the update-status endpoint. We don't need the response,
  // just to trigger the action. This won't block rendering.
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/jobs/update-status`, { cache: 'no-store' });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: { 
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        }
      } 
    }
  );

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("apply_end_date", { ascending: true, nullsFirst: false });

  if (error) {
    return <p className="text-red-500">Error loading jobs: {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <Link key={job.id} href={`/jobs/${job.id}`} className="block card hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold font-display text-[var(--foreground)]">{job.exam_name || job.title}</h2>
                  {getStatusBadge(job.status)}
                </div>
                <p className="font-semibold text-orange-600 dark:text-orange-500">{job.conducting_body}</p>
              </div>
              <div className="shrink-0">
                <button className="btn-primary">View Details</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-[var(--border)] text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[var(--muted-foreground)] flex items-center gap-1.5"><Briefcase size={14} /> Vacancies</span>
                <span className="font-semibold">{job.vacancies || "TBD"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--muted-foreground)] flex items-center gap-1.5"><Calendar size={14} /> Apply End</span>
                <span className="font-semibold">{formatDate(job.apply_end_date)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--muted-foreground)] flex items-center gap-1.5"><Calendar size={14} /> Exam Date</span>
                <span className="font-semibold">{formatDate(job.exam_date)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--muted-foreground)] flex items-center gap-1.5"><MapPin size={14} /> Location</span>
                <span className="font-semibold">{job.state || "Pan-India"}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function JobsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card p-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-[var(--border)]">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobsPage() {
  // Mock data to resolve TypeScript errors for the preserved detail UI sections
  const examName = "Sample Government Exam 2026";
  const conductingBody = "Staff Selection Commission";
  const daysLeft = 5;
  const effectiveStatus = "open";
  const userProfile = { age: 25 };
  const isEligible = true;
  const eligibilityMessage = "You meet the basic requirements for this role based on your profile.";
  const isTracking = false;
  const tracked = false;
  const isPremium = false;
  const expandedSyllabus: Record<string, boolean> = {};

  interface JobDetails {
    vacancies?: number;
    apply_start_date?: string;
    apply_end_date?: string;
    correction_date?: string;
    admit_card_date?: string;
    exam_date?: string;
    result_date?: string;
    job_level?: string;
    age_min?: number;
    age_max?: number;
    qualification_required?: string;
    experience?: string;
    pay_scale?: string;
    vacancy_distribution?: Record<string, number>;
    syllabus?: Record<string, string[] | string>;
    official_website?: string;
    notification_pdf_url?: string;
  }

  const job: JobDetails = {
    vacancies: 8400,
    apply_start_date: "2026-01-01",
    apply_end_date: "2026-02-01",
    correction_date: "2026-02-05",
    admit_card_date: "2026-02-20",
    exam_date: "2026-03-01",
    result_date: "2026-04-01",
    job_level: "Central",
    age_min: 18,
    age_max: 32,
    qualification_required: "Bachelor's Degree",
    experience: "Fresher / Not specified",
    pay_scale: "Pay Level 4-7",
    vacancy_distribution: { UR: 3200, OBC: 2100, SC: 1200, ST: 600, EWS: 800, PwD: 500 },
    syllabus: {
      "General Intelligence": ["Analogies", "Spatial Visualization", "Visual Memory"],
      "Quantitative Aptitude": ["Percentages", "Ratio and Proportion", "Averages"]
    },
    official_website: "https://ssc.nic.in",
    notification_pdf_url: "https://ssc.nic.in/pdf"
  };

  return (
    <>
      {/* Main List Section */}
      <main className="page-main bg-slate-50 dark:bg-slate-900/50">
        <section className="page-container max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-bold font-display text-center mb-2">Latest Government Jobs</h1>
          <p className="text-lg text-center text-[var(--muted-foreground)] mb-10">Find your dream sarkari naukri with AvsarGrid.</p>
          <Suspense fallback={<JobsLoadingSkeleton />}>
            <JobsList />
          </Suspense>
        </section>
      </main>

      {/* Preserved Detail Section */}
      <div className="border-t border-[var(--border)] pt-12 pb-24 bg-[var(--background)]">
        <section className="page-container max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--muted-foreground)] mb-6 text-center">UI Preview: Job Details Template</h2>
          </div>
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400">
            <ArrowLeft size={16} /> Back to Jobs
          </Link>

          {/* SECTION 1: Header */}
          <div className="card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center flex-wrap gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display text-[var(--foreground)]">{examName}</h1>
                  {getStatusBadge(effectiveStatus)}
                </div>
                <p className="text-lg font-medium text-orange-600 dark:text-orange-500">{conductingBody}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-[var(--border)]">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1.5"><Briefcase size={16} /> Vacancies</span>
                <span className="font-semibold text-lg">{job.vacancies || "TBD"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1.5"><Calendar size={16} /> Apply End</span>
                <span className={`font-semibold text-lg ${daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 ? "text-red-600 dark:text-red-400" : ""}`}>
                  {formatDate(job.apply_end_date)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1.5"><Calendar size={16} /> Exam Date</span>
                <span className="font-semibold text-lg">{formatDate(job.exam_date)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1.5"><MapPin size={16} /> Job Level</span>
                <span className="font-semibold text-lg">{job.job_level || "State/Central"}</span>
              </div>
            </div>
          </div>

          {/* SECTION 7: AI Eligibility Notice */}
          {userProfile && (
            <div className={`rounded-xl p-5 border flex items-start gap-3 ${isEligible ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300'}`}>
              {isEligible ? <CheckCircle2 className="shrink-0 mt-0.5" /> : <XCircle className="shrink-0 mt-0.5" />}
              <div>
                <h3 className="font-semibold text-base">{isEligible ? "✅ You are eligible for this exam" : "❌ You may not be eligible"}</h3>
                <p className="text-sm mt-1 opacity-90">{eligibilityMessage}</p>
              </div>
            </div>
          )}

          {/* SECTION 6: Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {job.official_website ? (
              <a href={job.official_website} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 sm:flex-none justify-center gap-2">
                <ExternalLink size={18} /> Apply Now
              </a>
            ) : (
              <button disabled className="btn-primary flex-1 sm:flex-none justify-center opacity-50 cursor-not-allowed">Apply Now</button>
            )}

            {job.notification_pdf_url && (
              <a href={job.notification_pdf_url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 sm:flex-none justify-center gap-2">
                <Download size={18} /> Download Notification PDF
              </a>
            )}

            <button disabled={isTracking || tracked} className="btn-secondary flex-1 sm:flex-none justify-center gap-2">
              <Bookmark size={18} className={tracked ? "fill-current" : ""} /> {tracked ? "Added to Tracker" : "Add to Tracker"}
            </button>

            <button className={`btn-secondary flex-1 sm:flex-none justify-center gap-2 ${!isPremium ? 'opacity-90' : 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'}`}>
              <Sparkles size={18} className={isPremium ? 'text-purple-500' : ''} /> Generate Study Plan {!isPremium && <Lock size={14} className="ml-1" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION 2: Important Dates */}
            <div className="card p-6">
              <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2"><Calendar className="text-blue-600 dark:text-blue-400" /> Important Dates</h2>
              <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[var(--muted-foreground)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Event</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr className="bg-[var(--surface)] hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium">Application Start</td>
                      <td className="px-4 py-3">{formatDate(job.apply_start_date)}</td>
                    </tr>
                    <tr className="bg-[var(--surface)] hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium">Application End</td>
                      <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">{formatDate(job.apply_end_date)}</td>
                    </tr>
                    <tr className="bg-[var(--surface)] hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium">Correction Window</td>
                      <td className="px-4 py-3">{formatDate(job.correction_date)}</td>
                    </tr>
                    <tr className="bg-[var(--surface)] hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium">Admit Card</td>
                      <td className="px-4 py-3">{formatDate(job.admit_card_date)}</td>
                    </tr>
                    <tr className="bg-[var(--surface)] hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium">Exam Date</td>
                      <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{formatDate(job.exam_date)}</td>
                    </tr>
                    <tr className="bg-[var(--surface)] hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium">Result Date</td>
                      <td className="px-4 py-3">{formatDate(job.result_date)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 4: Eligibility Criteria */}
            <div className="card p-6">
              <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2"><GraduationCap className="text-blue-600 dark:text-blue-400" /> Eligibility Criteria</h2>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0"><Calendar size={20} /></div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Age Limit</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                      {job.age_min ? `${job.age_min} ` : "Min NA "} to {job.age_max ? `${job.age_max} years` : "Max NA"}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 shrink-0"><GraduationCap size={20} /></div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Qualification</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{job.qualification_required || "Not specified"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shrink-0"><Briefcase size={20} /></div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Experience</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{job.experience || "Fresher / Not specified"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shrink-0"><IndianRupee size={20} /></div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Pay Scale</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{job.pay_scale || "As per norms"}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* SECTION 3: Vacancy Distribution */}
          {job.vacancy_distribution && Object.keys(job.vacancy_distribution).length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold font-display mb-4">Vacancy Distribution</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border border-[var(--border)] rounded-lg">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[var(--muted-foreground)]">
                    <tr>
                      {['UR', 'OBC', 'SC', 'ST', 'EWS', 'PwD'].map(cat => (
                        <th key={cat} className="px-4 py-3 font-medium border-b border-[var(--border)]">{cat}</th>
                      ))}
                      <th className="px-4 py-3 font-semibold border-b border-[var(--border)] bg-blue-50/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-x divide-[var(--border)] bg-[var(--surface)]">
                    <tr>
                      {['UR', 'OBC', 'SC', 'ST', 'EWS', 'PwD'].map(cat => (
                        <td key={cat} className="px-4 py-3 text-center border-r border-[var(--border)]">
                          {job.vacancy_distribution?.[cat] || "-"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-bold bg-blue-50/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                        {job.vacancies || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 5: Syllabus */}
          {job.syllabus && Object.keys(job.syllabus).length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2"><Sparkles className="text-blue-600 dark:text-blue-400" /> Detailed Syllabus</h2>
              <div className="space-y-3">
                {Object.entries(job.syllabus).map(([subject, topics]) => {
                  const isExpanded = expandedSyllabus[subject] || false;
                  return (
                    <div key={subject} className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
                      <button
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <span className="font-semibold text-[var(--foreground)]">{subject}</span>
                        {isExpanded ? <ChevronUp size={20} className="text-[var(--muted-foreground)]" /> : <ChevronDown size={20} className="text-[var(--muted-foreground)]" />}
                      </button>
                      {isExpanded && (
                        <div className="p-4 border-t border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/30">
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Array.isArray(topics) ? topics.map((topic, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--muted-foreground)]">
                                <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <span>{topic}</span>
                              </li>
                            )) : (
                              <li className="text-sm text-[var(--muted-foreground)]">{String(topics)}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}