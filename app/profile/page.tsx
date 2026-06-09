"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  Award,
  Briefcase,
  DollarSign,
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

function formatListForInput(value: string | string[] | null): string {
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
  const [workMode, setWorkMode] = useState("");
  const [expectedSalary, setExpectedSalary] = useState<number | "">("");

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

      const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error.message);
      }

      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setEducation(data.education || "");
        setDegree(data.degree || "");
        setSkills(formatSkillsForInput(data.skills));
        setExperienceYears(data.experience_years || "");
        setProjects(data.projects || "");
        setCertifications(formatListForInput(data.certifications));
        setPreferredJobType(data.preferred_job_type || "");
        setWorkMode(
          ["Remote", "Hybrid", "Onsite"].includes(data.preferred_job_type ?? "")
            ? data.preferred_job_type ?? ""
            : "",
        );
        setExpectedSalary(data.expected_salary || "");
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
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
        .from("users")
        .update({
          full_name: fullName,
          phone,
          location,
          education,
          degree,
          skills: parseCommaList(skills),
          experience_years: experienceYears === "" ? 0 : Number(experienceYears),
          projects: projects || null,
          certifications: parseCommaList(certifications).length > 0 ? parseCommaList(certifications) : null,
          preferred_job_type: workMode || preferredJobType || null,
          expected_salary: expectedSalary === "" ? 0 : Number(expectedSalary),
        })
        .eq("id", user.id);

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
            <h1 className="page-title mt-1">Career Profile</h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Keep your profile updated for better AI job matching on AvsarGrid.
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

            <SectionCard icon={MapPin} title="Career Preferences" description="Job type, work mode, and salary">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="preferredJobType">Job Type</label>
                  <select
                    id="preferredJobType"
                    className="input"
                    value={preferredJobType}
                    onChange={(e) => setPreferredJobType(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="workMode">Work Mode</label>
                  <select
                    id="workMode"
                    className="input"
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="expectedSalary">
                    <DollarSign size={14} className="mr-1 inline" />
                    Expected Salary (annual)
                  </label>
                  <input
                    id="expectedSalary"
                    type="number"
                    className="input"
                    placeholder="e.g. 80000"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value === "" ? "" : Number(e.target.value))}
                  />
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
