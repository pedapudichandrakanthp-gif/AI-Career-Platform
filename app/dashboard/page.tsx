import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Clock, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  return (
    <main className="page-main bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      <div className="page-container max-w-6xl mx-auto space-y-8 py-8">
        <Suspense fallback={<DashboardLoading />}>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}

async function DashboardContent() {
  const cookieStore = await cookies();
  
  // Initialize Server-Side Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { 
          return cookieStore.getAll(); 
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Fetch all dashboard data concurrently
  const [profileRes, applicationsRes, jobsRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('jobs').select('*').eq('is_active', true)
  ]);

  const profile = profileRes.data;

  interface DashboardJob {
    id: string;
    title?: string;
    exam_name?: string;
    conducting_body?: string;
    apply_end_date?: string;
    age_max?: number;
    age_min?: number;
    state?: string;
  }

  interface DashboardApplication {
    id: string;
    title?: string;
    company?: string;
    status?: string;
  }

  const applications: DashboardApplication[] = applicationsRes.data || [];
  const jobs: DashboardJob[] = jobsRes.data || [];

  // Calculate Eligibility & Find Urgent Deadlines
  let eligibleJobsCount = 0;
  const urgentJobs: DashboardJob[] = [];
  const now = new Date();

  const getDaysRemaining = (dateString: string) => {
    return Math.ceil((new Date(dateString).getTime() - now.getTime()) / (1000 * 3600 * 24));
  };

  jobs.forEach(job => {
    // Basic Eligibility Check
    let isEligible = true;
    let maxAge = job.age_max || 99;
    
    if (profile?.category === 'OBC') maxAge += 3;
    if (profile?.category === 'SC' || profile?.category === 'ST') maxAge += 5;
    
    if (job.age_min && profile?.age && profile.age < job.age_min) isEligible = false;
    if (profile?.age && profile.age > maxAge) isEligible = false;
    if (job.state && job.state !== 'Central' && profile?.current_state && job.state !== profile.current_state) isEligible = false;
    
    if (isEligible) eligibleJobsCount++;

    // Urgent Deadline Check
    if (job.apply_end_date) {
      const days = getDaysRemaining(job.apply_end_date);
      if (days >= 0 && days <= 7) {
        urgentJobs.push(job);
      }
    }
  });

  urgentJobs.sort((a, b) => new Date(a.apply_end_date || "").getTime() - new Date(b.apply_end_date || "").getTime());

  // Profile Completion Logic
  const requiredFields = ['full_name', 'date_of_birth', 'gender', 'category', 'current_state', 'highest_qualification'];
  const missingFields = requiredFields.filter(f => {
    const value = profile?.[f as keyof typeof profile];
    return value === null || value === undefined || value === '';
  });
  const completionPercent = profile ? Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100) : 0;
  const formatField = (f: string) => f.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Kanban Columns
  const COLUMNS = ["Saved", "Applied", "Preparing", "Result Awaited", "Selected"];

  // --- SERVER ACTIONS ---

  async function updateStatus(formData: FormData) {
    "use server";
    const appId = formData.get("appId") as string;
    const status = formData.get("status") as string;
    if (!appId || !status) return;

    const cookieStore = await cookies();
    const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { 
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { 
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        }
      }
    });

    await sb.from('applications').update({ status }).eq('id', appId);
    revalidatePath('/dashboard');
  }

  return (
    <div className="space-y-10">
      
      {/* SECTION 1: Welcome + Eligibility Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-display">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Aspirant'}!
          </h1>
          <p className="mt-4 text-4xl sm:text-5xl font-extrabold text-blue-100 tracking-tight">
            You are eligible for <span className="text-white">{eligibleJobsCount}</span> government jobs
          </p>
          <p className="mt-4 text-sm sm:text-base font-medium text-blue-200/90 flex flex-wrap items-center gap-2">
            Based on your profile: {profile?.highest_qualification || 'Graduate'} | Age {profile?.age || '24'} | {profile?.category || 'UR'} | {profile?.state || 'India'}
          </p>
          <div className="mt-8">
            <Link href="/jobs?eligible=true" className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-50 hover:scale-[1.02] transition-all shadow-sm">
              View All Eligible Jobs
            </Link>
          </div>
        </div>
        <Sparkles className="absolute -right-10 -bottom-10 text-white opacity-10 w-64 h-64 pointer-events-none" />
      </div>

      {/* SECTION 2: Urgent Deadlines */}
      {urgentJobs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[var(--foreground)]">
            <span className="text-red-500 animate-pulse">🔴</span> Apply Before It&apos;s Too Late
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {urgentJobs.map(job => {
              const daysLeft = getDaysRemaining(job.apply_end_date || "");
              const isRed = daysLeft <= 3;
              return (
                <div key={job.id} className={`card p-5 border-l-4 ${isRed ? 'border-l-red-500 bg-red-50/30 dark:bg-red-900/10' : 'border-l-orange-400'}`}>
                  <h3 className="font-semibold text-lg line-clamp-1">{job.exam_name || job.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-1">{job.conducting_body}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className={`text-sm font-semibold flex items-center gap-1.5 ${isRed ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      <Clock size={14}/> {daysLeft === 0 ? 'Ends Today' : `${daysLeft} days left`}
                    </span>
                    <Link href={`/jobs/${job.id}`} className="btn-secondary text-xs px-4 py-2 border-none bg-white dark:bg-slate-800 shadow-sm hover:shadow">
                      Apply Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: My Applications (Kanban) */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">My Applications</h2>
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
          {COLUMNS.map(col => {
            const colApps = applications.filter(a => (a.status || 'Saved').toLowerCase() === col.toLowerCase());
            return (
              <div key={col} className="min-w-[300px] flex-shrink-0 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 snap-start border border-[var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-[var(--muted-foreground)] uppercase tracking-wider">{col}</h3>
                  <span className="bg-slate-200 dark:bg-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full">{colApps.length}</span>
                </div>
                <div className="space-y-3">
                  {colApps.map(app => (
                    <div key={app.id} className="bg-white dark:bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)] relative group">
                      <h4 className="font-semibold text-sm leading-tight text-[var(--foreground)]">{app.title}</h4>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{app.company}</p>
                      
                      <form action={updateStatus} className="mt-4 flex items-center gap-2">
                        <input type="hidden" name="appId" value={app.id} />
                        <select name="status" defaultValue={app.status || "Saved"} className="input text-xs py-1.5 px-2 h-auto flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 cursor-pointer focus:ring-1 focus:ring-blue-500">
                          {COLUMNS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                        </select>
                        <button type="submit" className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                          Update
                        </button>
                      </form>
                    </div>
                  ))}
                  {colApps.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <p className="text-xs font-medium text-[var(--muted-foreground)]">No apps here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 4: Today's Study Tasks */}
        <section className="card p-6 sm:p-8 border-t-4 border-t-green-500">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-[var(--foreground)]">
            Today&apos;s Study Tasks
          </h2>
          <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">No active study tasks</p>
            <Link href="/jobs" className="mt-4 inline-block btn-primary text-sm">
              Start Exam Preparation
            </Link>
          </div>
        </section>

        <div className="space-y-8">
          {/* SECTION 5: Upcoming Notifications */}
          <section className="card p-6 sm:p-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-[var(--foreground)]">
              Coming Soon
            </h2>
            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">No upcoming exam notifications</p>
            </div>
          </section>

          {/* SECTION 6: Profile Completion */}
          <section className="card p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 border-indigo-100 dark:border-indigo-900/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                  Profile Completion
                </h2>
                <p className="text-sm font-medium text-indigo-700/80 dark:text-indigo-400/80 mt-1">
                  Complete your profile to see more eligible exams
                </p>
              </div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {completionPercent}%
              </div>
            </div>
            
            <div className="mt-5 w-full bg-white dark:bg-slate-800 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionPercent}%` }}></div>
            </div>
            
            {missingFields.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {missingFields.map(f => (
                  <Link key={f} href="/onboarding" className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors shadow-sm">
                    + Add {formatField(f)}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-48 sm:h-56 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
    </div>
  );
}
