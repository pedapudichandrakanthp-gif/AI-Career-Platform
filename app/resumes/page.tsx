"use client";

import { useState } from "react";
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

      const { data: publicUrlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("resumes")
        .insert([
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
    <main className="p-10">
      <h1 className="mb-6 text-3xl font-bold">
        Upload Resume
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <button
        onClick={uploadResume}
        disabled={loading}
        className="ml-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </main>
    </ProtectedRoute>
  );
}
