import { Metadata } from "next";
import { Award, CheckCircle2, Sparkles } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = createServiceClient();
  
  const { data: user } = await supabase
    .from("users")
    .select("full_name")
    .eq("username", username)
    .eq("profile_public", true)
    .single();

  if (!user) {
    return { title: "Private Profile | AvsarGrid" };
  }

  return {
    title: `${user.full_name}'s Resume Score | AvsarGrid`,
    description: `Check out ${user.full_name}'s ATS Score and top skills verified by AvsarGrid AI.`,
    openGraph: {
      title: `${user.full_name}'s Resume Score`,
      description: `Verified ATS Score and AI analysis for ${user.full_name}.`,
    },
  };
}

export default async function ScorePage({ params }: Props) {
  const { username } = await params;
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("profile_public", true)
    .single();

  if (!user) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="card text-center max-w-md w-full py-12">
          <h1 className="text-xl font-semibold mb-2">This profile is private</h1>
          <p className="text-[var(--muted-foreground)]">The user has not made their resume score public.</p>
        </div>
      </main>
    );
  }

  const { data: analysis } = await supabase
    .from("resume_analysis")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const atsScore = analysis?.ats_score || 0;
  const topSkills = analysis?.skills_found?.slice(0, 8) || user.skills?.slice(0, 8) || [];

  return (
    <main className="flex min-h-[80vh] items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            <Sparkles size={14} />
            Analyzed by AvsarGrid AI
          </div>
          
          <h1 className="font-display text-3xl font-bold text-[var(--foreground)] mt-2">
            {user.full_name}
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mt-1">
            {user.role || "Professional"}
          </p>

          <div className="my-10 flex flex-col items-center justify-center relative">
             <div className="h-40 w-40 rounded-full border-[8px] border-blue-500 flex items-center justify-center bg-[var(--background)] shadow-xl z-10">
               <span className="text-6xl font-black text-[var(--foreground)]">{atsScore}</span>
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 bg-blue-500/30 blur-2xl rounded-full" />
             <p className="mt-4 font-semibold text-lg text-blue-600 dark:text-blue-400 flex items-center gap-2">
               <Award size={20} />
               Verified ATS Score
             </p>
          </div>

          <div className="w-full">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
              Top Verified Skills
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {topSkills.length > 0 ? (
                topSkills.map((skill: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium">
                    <CheckCircle2 size={14} className="text-green-500" />
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[var(--muted-foreground)] text-sm">No skills extracted yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}