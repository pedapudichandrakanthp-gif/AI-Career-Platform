"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  Save,
  User,
  Wrench,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useResumeUpdated } from "@/hooks/useResumeUpdated";
import { supabase } from "@/lib/supabase";

function formatSkillsForInput(value: string | string[] | null): string {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

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

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [degree, setDegree] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");
  const [projects, setProjects] = useState("");
  const [certifications, setCertifications] = useState("");
  const [preferredJobType, setPreferredJobType] = useState("");

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
        setLocation(data.current_state || "");
        setEducation(data.highest_qualification || "");
        setDegree(data.degree || "");
        setSkills(formatSkillsForInput(data.exam_category_preferences || []));
        setExperienceYears("");
        setProjects("");
        setCertifications("");
        setPreferredJobType(data.exam_state_preference || "");
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

  useResumeUpdated(() => {
    fetchProfile();
  });

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
          current_state: location,
          highest_qualification: education,
          degree,
          exam_category_preferences: parseCommaList(skills),
          exam_state_preference: preferredJobType || null,
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="fullName">Full Name</label>
                  <input id="fullName" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="phone">Phone</label>
                  <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="location">Location</label>
                  <input id="location" className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Wrench} title="Skills" description="Technical and professional skills">
              <label className="label" htmlFor="skills">Skills (comma-separated)</label>
              <textarea
                id="skills"
                className="input min-h-[100px]"
                placeholder="React, TypeScript, Python, SQL..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </SectionCard>

            <SectionCard icon={GraduationCap} title="Education" description="Academic background">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="education">Institution</label>
                  <input id="education" className="input" value={education} onChange={(e) => setEducation(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="degree">Degree</label>
                  <input id="degree" className="input" value={degree} onChange={(e) => setDegree(e.target.value)} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Briefcase} title="Experience" description="Professional background">
              <label className="label" htmlFor="experienceYears">Years of Experience</label>
              <input
                id="experienceYears"
                type="number"
                className="input"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </SectionCard>

            <SectionCard icon={Briefcase} title="Projects" description="Notable projects and achievements">
              <textarea
                className="input min-h-[100px]"
                placeholder="Describe key projects..."
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
              />
            </SectionCard>

            <SectionCard icon={Award} title="Certifications" description="Professional certifications">
              <input
                className="input"
                placeholder="AWS, PMP, Google Cloud... (comma-separated)"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
              />
            </SectionCard>

            <SectionCard icon={MapPin} title="Exam Preferences" description="Exam type and preferences">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="preferredJobType">Exam Preference</label>
                  <select
                    id="preferredJobType"
                    className="input"
                    value={preferredJobType}
                    onChange={(e) => setPreferredJobType(e.target.value)}
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
