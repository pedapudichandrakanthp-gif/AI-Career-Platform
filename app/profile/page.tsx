"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";

function formatSkillsForInput(value: string | string[] | null): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value ?? "";
}

function parseSkillsForDatabase(value: string): string[] {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [degree, setDegree] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");
  const [preferredJobType, setPreferredJobType] = useState("");
  const [expectedSalary, setExpectedSalary] = useState<number | "">("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
        setPreferredJobType(data.preferred_job_type || "");
        setExpectedSalary(data.expected_salary || "");
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          phone,
          location,
          education,
          degree,
          skills: parseSkillsForDatabase(skills),
          experience_years: experienceYears === "" ? 0 : Number(experienceYears),
          preferred_job_type: preferredJobType,
          expected_salary: expectedSalary === "" ? 0 : Number(expectedSalary),
        })
        .eq("id", user.id);

      if (error) {
        alert(`Error saving profile: ${error.message}`);
        setSaving(false);
        return;
      }

      alert("Profile Updated Successfully");
    } catch (err) {
      console.error("Unexpected error saving profile:", err);
      alert("An unexpected network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="page-main">
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container max-w-2xl">
          <h1 className="page-title">My Profile</h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Update your career information to improve job matching.
          </p>

          <div className="card mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                className="input"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                className="input"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className="input"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="education">
                Education
              </label>
              <input
                id="education"
                className="input"
                placeholder="Education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="degree">
                Degree
              </label>
              <input
                id="degree"
                className="input"
                placeholder="Degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="skills">
                Skills
              </label>
              <textarea
                id="skills"
                className="input min-h-[100px]"
                placeholder="Skills (React, Java, SQL...)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="experienceYears">
                Experience Years
              </label>
              <input
                id="experienceYears"
                type="number"
                className="input"
                placeholder="Experience Years"
                value={experienceYears}
                onChange={(e) =>
                  setExperienceYears(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            <div>
              <label className="label" htmlFor="preferredJobType">
                Preferred Job Type
              </label>
              <input
                id="preferredJobType"
                className="input"
                placeholder="Preferred Job Type"
                value={preferredJobType}
                onChange={(e) => setPreferredJobType(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="expectedSalary">
                Expected Salary
              </label>
              <input
                id="expectedSalary"
                type="number"
                className="input"
                placeholder="Expected Salary"
                value={expectedSalary}
                onChange={(e) =>
                  setExpectedSalary(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="btn-success w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
