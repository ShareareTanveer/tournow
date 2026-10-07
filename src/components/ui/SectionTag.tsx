interface SectionTagProps {
  children: React.ReactNode
  className?: string
}

export default function SectionTag({ children, className = '' }: SectionTagProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.13em] ${className}`.trim()}
      style={{
        backgroundColor: '#eaf7fc',
        color: '#0395d5',
        borderColor: '#d5eef8',
      }}
    >
      {children}
    </div>
  )
}
