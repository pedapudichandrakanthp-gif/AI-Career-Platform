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

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [degree, setDegree] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [preferredJobType, setPreferredJobType] = useState("");
  const [expectedSalary, setExpectedSalary] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setLocation(data.location || "");
      setEducation(data.education || "");
      setDegree(data.degree || "");
      setSkills(formatSkillsForInput(data.skills));
      setExperienceYears(data.experience_years || 0);
      setPreferredJobType(data.preferred_job_type || "");
      setExpectedSalary(data.expected_salary || 0);
    }

    setLoading(false);
  };

  const saveProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
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
        experience_years: experienceYears,
        preferred_job_type: preferredJobType,
        expected_salary: expectedSalary,
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile Updated Successfully");
  };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      <div className="max-w-2xl space-y-4 bg-slate-800 p-6 rounded-lg">

        <input
          className="w-full p-3 rounded bg-white text-black border"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="w-full p-3 rounded text-black"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full p-3 rounded text-black"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          className="w-full p-3 rounded text-black"
          placeholder="Education"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />

        <input
          className="w-full p-3 rounded text-black"
          placeholder="Degree"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
        />

        <textarea
          className="w-full p-3 rounded text-black"
          placeholder="Skills (React, Java, SQL...)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />

        <input
          type="number"
          className="w-full p-3 rounded text-black"
          placeholder="Experience Years"
          value={experienceYears}
          onChange={(e) =>
            setExperienceYears(Number(e.target.value))
          }
        />

        <input
          className="w-full p-3 rounded text-black"
          placeholder="Preferred Job Type"
          value={preferredJobType}
          onChange={(e) =>
            setPreferredJobType(e.target.value)
          }
        />

        <input
          type="number"
          className="w-full p-3 rounded text-black"
          placeholder="Expected Salary"
          value={expectedSalary}
          onChange={(e) =>
            setExpectedSalary(Number(e.target.value))
          }
        />

        <button
          onClick={saveProfile}
          className="bg-green-600 px-6 py-3 rounded"
        >
          Save Profile
        </button>
      </div>
    </main>
    </ProtectedRoute>
  );
}
