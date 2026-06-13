'use client'

interface Job {
  id: string
  title: string
  company: string
  location?: string
  job_type?: string
  work_mode?: string
  apply_url?: string
  salary_min?: number
  salary_max?: number
}

interface JobCardProps {
  job: Job
  onSave?: (jobId: string) => void
  matchScore?: number | null
}

export default function JobCard({ job, onSave, matchScore }: JobCardProps) {
  return (
    <div className="border border-border rounded-lg p-5 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-base">{job.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {job.location && <span className="text-xs bg-secondary px-2 py-1 rounded">{job.location}</span>}
            {job.job_type && <span className="text-xs bg-secondary px-2 py-1 rounded">{job.job_type}</span>}
            {job.work_mode && <span className="text-xs bg-secondary px-2 py-1 rounded">{job.work_mode}</span>}
          </div>
        </div>
        {matchScore != null && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
            matchScore >= 80 ? 'bg-green-100 text-green-700' :
            matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {matchScore}% Match
          </span>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        {job.apply_url && (
          <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90">
            Apply Now
          </a>
        )}
        {onSave && (
          <button onClick={() => onSave(job.id)}
            className="text-xs px-3 py-1.5 border border-border rounded-md hover:bg-secondary">
            Save Job
          </button>
        )}
      </div>
    </div>
  )
}