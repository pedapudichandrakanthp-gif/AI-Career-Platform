import { Suspense } from "react";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Briefcase, Calendar, MapPin } from "lucide-react";

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
  return (
    <main className="page-main bg-slate-50 dark:bg-slate-900/50">
      <section className="page-container max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold font-display text-center mb-2">Latest Government Exams</h1>
        <p className="text-lg text-center text-[var(--muted-foreground)] mb-10">Find your dream government exam with AvsarGrid.</p>
        <Suspense fallback={<JobsLoadingSkeleton />}>
          <JobsList />
        </Suspense>
      </section>
    </main>
  );
}