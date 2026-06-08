"use client";

import { useState } from "react";

import type { ExtractedProfile } from "@/types/ai";

interface ExtractedProfilePreviewProps {
  readonly initialProfile: ExtractedProfile;
  readonly onSave: (profile: ExtractedProfile) => Promise<void>;
  readonly onCancel: () => void;
  readonly saving?: boolean;
}

export default function ExtractedProfilePreview({
  initialProfile,
  onSave,
  onCancel,
  saving = false,
}: ExtractedProfilePreviewProps) {
  const [profile, setProfile] = useState<ExtractedProfile>(initialProfile);
  const [skillsInput, setSkillsInput] = useState(initialProfile.skills.join(", "));

  const handleSave = async () => {
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await onSave({
      ...profile,
      skills,
    });
  };

  return (
    <div className="card">
      <h2 className="section-title">Review Extracted Information</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Edit any fields before saving. Existing profile data will not be overwritten unless empty.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="extracted-full-name">
            Full Name
          </label>
          <input
            id="extracted-full-name"
            className="input"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="extracted-email">
            Email
          </label>
          <input
            id="extracted-email"
            type="email"
            className="input"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="extracted-phone">
            Phone
          </label>
          <input
            id="extracted-phone"
            className="input"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="extracted-location">
            Location
          </label>
          <input
            id="extracted-location"
            className="input"
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="extracted-skills">
            Skills
          </label>
          <input
            id="extracted-skills"
            className="input"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, TypeScript, SQL..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="extracted-education">
            Education
          </label>
          <textarea
            id="extracted-education"
            className="input min-h-[80px]"
            value={profile.education}
            onChange={(e) => setProfile({ ...profile, education: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="extracted-experience">
            Experience
          </label>
          <textarea
            id="extracted-experience"
            className="input min-h-[80px]"
            value={profile.experience}
            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="extracted-experience-years">
            Experience (Years)
          </label>
          <input
            id="extracted-experience-years"
            type="number"
            className="input"
            value={profile.experience_years ?? ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                experience_years: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={saving}>
          Cancel
        </button>
        <button type="button" onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
