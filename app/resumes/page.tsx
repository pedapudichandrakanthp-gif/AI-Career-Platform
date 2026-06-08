"use client";

import { useState } from "react";

import { FileUp } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadResume = async () => {
    try {
      if (!file) {
        alert("Select a file first");
        return;
      }

      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first");
        return;
      }

      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("resumes").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("resumes").insert([
        {
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrlData.publicUrl,
        },
      ]);

      if (dbError) {
        alert(dbError.message);
        return;
      }

      alert("Resume uploaded successfully");
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container max-w-2xl">
          <h1 className="page-title">Upload Resume</h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Upload your resume to enable AI-powered job matching.
          </p>

          <div className="card mt-8">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-8 dark:border-slate-700">
              <FileUp size={40} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Select a PDF file to upload
              </p>
              <input
                type="file"
                accept=".pdf"
                className="mt-4 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500 dark:text-slate-400"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                  Selected: {file.name}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={uploadResume}
              disabled={loading || !file}
              className="btn-primary mt-6 w-full sm:w-auto"
            >
              {loading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
