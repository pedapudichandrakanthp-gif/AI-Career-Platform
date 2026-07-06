import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ArrowLeft, Calendar, Download, ExternalLink } from "lucide-react";

interface Job {
  id: string;
  exam_name: string | null;
  conducting_body: string | null;
  job_level: string | null;
  category: string | null;
  state: string | null;
  vacancies: number | null;
  vacancies_ur: number | null;
  vacancies_obc: number | null;
  vacancies_sc: number | null;
  vacancies_st: number | null;
  vacancies_ews: number | null;
  vacancies_pwd: number | null;
  age_min: number | null;
  age_max: number | null;
  qualification_required: string | null;
  pay_scale: string | null;
  application_start_date: string | null;
  application_end_date: string | null;
  exam_date: string | null;
  result_date: string | null;
  notification_pdf_url: string | null;
  official_website: string | null;
  apply_link: string | null;
  syllabus: string | null;
  description: string | null;
  status: string | null;
  is_active: boolean | null;
}

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

const formatDate = (dateString?: string | null) => 
  dateString ? new Date(dateString).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "TBD";

async function JobDetail({ id }: { readonly id: string }) {
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

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    return (
      <main className="page-main">
        <div className="page-container max-w-5xl">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Exam not found</p>
          <Link href="/jobs" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Exams
          </Link>
        </div>
      </main>
    );
  }

  const jobData = job as Job;

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

        {/* Header */}
        <article className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="page-title">{jobData.exam_name ?? "Untitled Exam"}</h1>
              <p className="mt-2 text-lg text-orange-600 dark:text-orange-500 font-semibold">
                {jobData.conducting_body ?? "Government Exam"}
              </p>
            </div>
            {jobData.status && getStatusBadge(jobData.status)}
          </div>
        </article>

        {/* Important Dates */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
            Important Dates
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Application Start Date</dt>
              <dd className="mt-1 text-slate-900 dark:text-white font-medium">
                {formatDate(jobData.application_start_date)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Application End Date</dt>
              <dd className="mt-1 text-slate-900 dark:text-white font-medium">
                {formatDate(jobData.application_end_date)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Exam Date</dt>
              <dd className="mt-1 text-slate-900 dark:text-white font-medium">
                {formatDate(jobData.exam_date)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Result Date</dt>
              <dd className="mt-1 text-slate-900 dark:text-white font-medium">
                {formatDate(jobData.result_date)}
              </dd>
            </div>
          </dl>
        </article>

        {/* Eligibility */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Eligibility</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Age Limit</dt>
              <dd className="mt-1 text-slate-900 dark:text-white font-medium">
                {jobData.age_min && jobData.age_max
                  ? `${jobData.age_min} - ${jobData.age_max} years`
                  : jobData.age_min
                    ? `${jobData.age_min}+ years`
                    : jobData.age_max
                      ? `Up to ${jobData.age_max} years`
                      : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Qualification Required</dt>
              <dd className="mt-1 text-slate-900 dark:text-white font-medium">
                {jobData.qualification_required ?? "Not specified"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Pay Scale</dt>
              <dd className="mt-1 text-slate-900 dark:text-white font-medium">
                {jobData.pay_scale ?? "Not specified"}
              </dd>
            </div>
          </dl>
        </article>

        {/* Vacancies */}
        <article className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Vacancies</h2>
          {jobData.vacancies ? (
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {jobData.vacancies.toLocaleString()} Posts
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {jobData.vacancies_ur && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">UR</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{jobData.vacancies_ur}</p>
                  </div>
                )}
                {jobData.vacancies_obc && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">OBC</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{jobData.vacancies_obc}</p>
                  </div>
                )}
                {jobData.vacancies_sc && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">SC</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{jobData.vacancies_sc}</p>
                  </div>
                )}
                {jobData.vacancies_st && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">ST</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{jobData.vacancies_st}</p>
                  </div>
                )}
                {jobData.vacancies_ews && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">EWS</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{jobData.vacancies_ews}</p>
                  </div>
                )}
                {jobData.vacancies_pwd && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">PwD</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{jobData.vacancies_pwd}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">Vacancy details not available yet.</p>
          )}
        </article>

        {/* Description */}
        {jobData.description && (
          <article className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {jobData.description}
              </p>
            </div>
          </article>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {jobData.apply_link && (
            <a
              href={jobData.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center"
            >
              <ExternalLink size={18} aria-hidden="true" />
              Apply Now
            </a>
          )}
          {jobData.notification_pdf_url && (
            <a
              href={jobData.notification_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center"
            >
              <Download size={18} aria-hidden="true" />
              Download Notification
            </a>
          )}
        </div>
      </section>
    </main>
  );
}

export default async function JobDetailsPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetail id={id} />;
}
