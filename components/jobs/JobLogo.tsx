interface JobLogoProps {
  company: string
  size?: number
}

export default function JobLogo({ company, size = 40 }: JobLogoProps) {
  const initial = company?.charAt(0)?.toUpperCase() || '?'

  return (
    <div style={{ width: size, height: size }}
      className="rounded-md bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
      {initial}
    </div>
  )
}