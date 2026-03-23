export function FormField({
  label,
  help,
  error,
  children,
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-ink">{label}</span>
        {help ? <span className="text-xs text-muted">{help}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-coral">{error}</p> : null}
    </label>
  )
}
