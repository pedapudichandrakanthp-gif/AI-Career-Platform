'use client'
import { useState } from 'react'

interface StudyPlanButtonProps {
  jobId: string
  examName: string
}

interface StudyPlan {
  exam_overview: string
  total_days: number
  daily_hours: number
  phases: Array<{
    phase: number
    name: string
    duration_days: number
    focus: string
    subjects: string[]
  }>
  weekly_schedule: Record<string, string[] | string>
  key_subjects: string[]
  important_topics: string[]
  preparation_tips: string[]
  recommended_books: string[]
  daily_checklist: string[]
}

export default function StudyPlanButton({ jobId, examName }: StudyPlanButtonProps) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [error, setError] = useState('')
  const [showPlan, setShowPlan] = useState(false)

  async function generatePlan() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setPlan(data.plan)
        setShowPlan(true)
      }
    } catch {
      setError('Failed to generate study plan. Please try again.')
    }
    setLoading(false)
  }

  if (showPlan && plan) {
    return (
      <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            📚 AI Study Plan — {examName}
          </h3>
          <button
            onClick={() => setShowPlan(false)}
            className="text-sm text-gray-400 hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        {/* Overview */}
        <p className="text-gray-300 text-sm mb-4">{plan.exam_overview}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{plan.total_days}</div>
            <div className="text-xs text-gray-400">Days Left</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{plan.daily_hours}h</div>
            <div className="text-xs text-gray-400">Daily Study</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{plan.phases?.length}</div>
            <div className="text-xs text-gray-400">Phases</div>
          </div>
        </div>

        {/* Phases */}
        {plan.phases && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">📋 Study Phases</h4>
            <div className="space-y-2">
              {plan.phases.map((phase, i: number) => (
                <div key={i} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white text-sm">
                      Phase {phase.phase}: {phase.name}
                    </span>
                    <span className="text-xs text-gray-400">{phase.duration_days} days</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{phase.focus}</p>
                  {phase.subjects && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {phase.subjects.map((s, j: number) => (
                        <span key={j} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Schedule */}
        {plan.weekly_schedule && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">📅 Weekly Schedule</h4>
            <div className="grid gap-2">
              {Object.entries(plan.weekly_schedule).map(([day, tasks]) => (
                <div key={day} className="flex gap-3 text-sm">
                  <span className="text-orange-400 font-medium w-24 shrink-0">{day}</span>
                  <span className="text-gray-300">{Array.isArray(tasks) ? tasks.join(' · ') : tasks}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Topics */}
        {plan.important_topics && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">🎯 Important Topics</h4>
            <div className="flex flex-wrap gap-2">
              {plan.important_topics.map((topic: string, i: number) => (
                <span key={i} className="text-xs bg-green-500/20 text-green-300 border border-green-500/20 px-2 py-1 rounded">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Daily Checklist */}
        {plan.daily_checklist && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">✅ Daily Checklist</h4>
            <div className="space-y-1">
              {plan.daily_checklist.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">◦</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preparation Tips */}
        {plan.preparation_tips && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">💡 Preparation Tips</h4>
            <div className="space-y-1">
              {plan.preparation_tips.map((tip: string, i: number) => (
                <div key={i} className="text-sm text-gray-300">• {tip}</div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Books */}
        {plan.recommended_books && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">📚 Recommended Books</h4>
            <div className="space-y-1">
              {plan.recommended_books.map((book: string, i: number) => (
                <div key={i} className="text-sm text-gray-300">• {book}</div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={generatePlan}
          className="mt-4 text-xs text-gray-400 hover:text-white underline"
        >
          🔄 Regenerate Plan
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={generatePlan}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 
                   text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⟳</span>
            Generating AI Study Plan...
          </>
        ) : (
          <>📚 Generate Study Plan</>
        )}
      </button>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  )
}
