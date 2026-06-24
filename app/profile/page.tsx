"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { GraduationCap, MapPin, Save, User } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  readonly icon: typeof User;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="section-card">
      <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-950/50">
          <Icon size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [qualification, setQualification] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [examPreference, setExamPreference] = useState("");

  // Display-only fields
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");


  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        if (error.code === "PGRST116") {
          // Profile doesn't exist yet, that's okay
          setMessage("Complete your profile to get started.");
        } else {
          setMessage(`Error loading profile: ${error.message}`);
        }
      }

      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setState(data.state || "");
        setQualification(data.qualification || "");
        setDegree(data.degree || "");
        setBranch(data.branch || "");
        setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : "");
        setLanguages(Array.isArray(data.languages) ? data.languages.join(', ') : "");
        setExamPreference(data.exam_preference || "");

        // Set display-only fields
        setAge(data.age || null);
        setGender(data.gender || "");
        setCategory(data.category || "");
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      setMessage("An unexpected error occurred while loading your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: fullName,
          phone,
          state,
          qualification,
          degree,
          branch,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          languages: languages.split(',').map(s => s.trim()).filter(Boolean),
          exam_preference: examPreference || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        setMessage(`Error: ${error.message}`);
        return;
      }

      setMessage("Profile saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="page-main flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container max-w-3xl">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Your Profile</p>
            <h1 className="page-title mt-1">Government Exam Profile</h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Keep your profile updated for better AI eligibility analysis on AvsarGrid.
            </p>
          </div>

          {message ? (
            <div className={`mt-6 rounded-xl p-4 text-sm ${message.startsWith("Error") ? "alert-error" : "alert-success"}`}>
              {message}
            </div>
          ) : null}

          <div className="mt-8 space-y-6">
            <SectionCard icon={User} title="Personal Information" description="Basic contact details">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label className="label" htmlFor="fullName">Full Name</label>
                  <input id="fullName" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="phone">Mobile Number</label>
                  <input id="phone" type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="state">State</label>
                  <input id="state" className="input" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div>
                  <label className="label">Age</label>
                  <p className="input-display">{age ? `${age} years` : 'N/A'}</p>
                </div>
                <div>
                  <label className="label">Gender</label>
                  <p className="input-display">{gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="label">Category</label>
                  <p className="input-display">{category || 'N/A'}</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={GraduationCap} title="Education" description="Academic background">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="qualification">Qualification</label>
                  <input id="qualification" className="input" value={qualification} onChange={(e) => setQualification(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="degree">Degree</label>
                  <input id="degree" className="input" value={degree} onChange={(e) => setDegree(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="branch">Branch / Specialization</label>
                  <input id="branch" className="input" value={branch} onChange={(e) => setBranch(e.target.value)} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={MapPin} title="Exam Preferences" description="Exam type and preferences">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="skills">Skills (comma-separated)</label>
                  <input id="skills" className="input" value={skills} onChange={(e) => setSkills(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="languages">Languages (comma-separated)</label>
                  <input id="languages" className="input" value={languages} onChange={(e) => setLanguages(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="examPreference">Primary Exam Preference</label>
                  <select
                    id="examPreference"
                    className="input"
                    value={examPreference}
                    onChange={(e) => setExamPreference(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="SSC">SSC Exams</option>
                    <option value="Banking">Banking Exams</option>
                    <option value="Railway">Railway Exams</option>
                    <option value="UPSC">UPSC Exams</option>
                    <option value="State PSC">State PSC Exams</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <button type="button" onClick={saveProfile} disabled={saving} className="btn-primary w-full gap-2 py-3 sm:w-auto">
              <Save size={18} />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
