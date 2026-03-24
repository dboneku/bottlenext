export function FormField({
  label,
  help,
  error,
  children,
}) {
  return (
    <label className="block space-y-2.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-900">{label}</span>
        {help ? <span className="text-xs text-slate-700">{help}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </label>
  )
}
