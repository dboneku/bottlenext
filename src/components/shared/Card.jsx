export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-line bg-panel/90 shadow-glow ${className}`}>{children}</div>
}
