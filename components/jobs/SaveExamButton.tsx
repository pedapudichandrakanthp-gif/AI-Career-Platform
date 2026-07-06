'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

interface SaveExamButtonProps {
  jobId: string
}

export default function SaveExamButton({ jobId }: SaveExamButtonProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const checkIfSaved = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single()
    setSaved(!!data)
  }, [jobId, supabase])

  useEffect(() => {
    checkIfSaved()
  }, [checkIfSaved])

  async function toggleSave() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }
    if (saved) {
      await supabase.from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId)
      setSaved(false)
    } else {
      await supabase.from('saved_jobs')
        .insert({ user_id: user.id, job_id: jobId })
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        saved
          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
      }`}
    >
      {loading ? '...' : saved ? '★ Saved' : '☆ Save Exam'}
    </button>
  )
}
