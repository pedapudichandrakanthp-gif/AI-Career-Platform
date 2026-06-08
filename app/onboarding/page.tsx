"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FileUp, Sparkles, Target } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ExtractedProfilePreview from "@/components/profile/ExtractedProfilePreview";
import { userHasResume } from "@/lib/onboarding/check";
import {
  getAccessToken,
  refreshUserDataAfterResumeUpdate,
  uploadAndProcessResume,
} from "@/lib/resumes/upload";
import { supabase } from "@/lib/supabase";
import type { ExtractedProfile } from "@/types/ai";

const steps = [
  { number: 1, label: "Upload Resume", icon: FileUp },
  { number: 2, label: "Review Profile", icon: Sparkles },
  { number: 3, label: "Recommendations", icon: Target },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);

  const checkExistingResume = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const hasResume = await userHasResume(supabase, user.id);

    if (hasResume) {
      router.replace("/dashboard");
      return;
    }

    setCheckingResume(false);
  }, [router]);

  useEffect(() => {
    checkExistingResume();
  }, [checkExistingResume]);

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a resume file.");
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgress("Uploading resume...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const accessToken = await getAccessToken(supabase);

      setUploadProgress("Extracting profile with AI...");

      const result = await uploadAndProcessResume(supabase, {
        file,
        userId: user.id,
        accessToken,
        replaceExisting: false,
      });

      setUploadProgress("Generating match scores...");
      await refreshUserDataAfterResumeUpdate(accessToken);

      setSuccessMessage("Resume uploaded successfully!");

      if (result.extractedProfile) {
        setExtractedProfile(result.extractedProfile);
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleSaveProfile = async (profile: ExtractedProfile) => {
    setSavingProfile(true);
    setErrorMessage("");

    try {
      const accessToken = await getAccessToken(supabase);

      const response = await fetch("/api/profile/save-extracted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ profile, overwriteEmptyOnly: true }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save profile.");
      }

      setSuccessMessage("Profile saved successfully!");
      setCurrentStep(3);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSkipProfile = () => {
    setCurrentStep(3);
  };

  if (checkingResume) {
    return (
      <ProtectedRoute>
        <main className="page-main flex items-center justify-center">
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container max-w-3xl">
          <h1 className="page-title">Welcome! Let&apos;s Get Started</h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Complete these steps to unlock AI-powered job recommendations.
          </p>

          <div className="mt-8 flex items-center justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const active = currentStep === step.number;
              const completed = currentStep > step.number;

              return (
                <div key={step.number} className="flex flex-1 flex-col items-center text-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      active
                        ? "bg-blue-600 text-white"
                        : completed
                          ? "bg-green-600 text-white"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <span className="mt-2 hidden text-xs font-medium sm:block">{step.label}</span>
                </div>
              );
            })}
          </div>

          {errorMessage ? <div className="alert-error mt-6">{errorMessage}</div> : null}
          {successMessage ? <div className="alert-success mt-6">{successMessage}</div> : null}

          {currentStep === 1 ? (
            <div className="card mt-8">
              <h2 className="section-title">Step 1: Upload Resume</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Upload your resume in PDF format. AI will extract your profile information.
              </p>

              <div className="mt-6 flex flex-col items-center rounded-xl border-2 border-dashed border-slate-300 p-8 dark:border-slate-700">
                <FileUp size={40} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <input
                  type="file"
                  accept=".pdf"
                  className="mt-4 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <p className="mt-2 text-sm font-medium">{file.name}</p>
                ) : null}
              </div>

              {uploadProgress ? (
                <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">{uploadProgress}</p>
              ) : null}

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !file}
                className="btn-primary mt-6 w-full sm:w-auto"
              >
                {uploading ? "Processing..." : "Upload & Continue"}
              </button>
            </div>
          ) : null}

          {currentStep === 2 && extractedProfile ? (
            <div className="mt-8">
              <ExtractedProfilePreview
                initialProfile={extractedProfile}
                onSave={handleSaveProfile}
                onCancel={handleSkipProfile}
                saving={savingProfile}
              />
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="card mt-8 text-center">
              <h2 className="section-title">Step 3: View Recommendations</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Your match scores have been generated. Explore jobs tailored to your profile.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/recommendations" className="btn-primary">
                  View Recommendations
                </Link>
                <Link href="/dashboard" className="btn-secondary">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </ProtectedRoute>
  );
}
