/**
 * StatusBadge - Reusable colored status indicator badge.
 * @param {Object} props
 * @param {string} props.label - Display text
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} [props.variant] - Color variant
 * @param {boolean} [props.pulse] - Show a pulsing dot animation
 */
export default function StatusBadge({ label, variant = 'neutral', pulse = false }) {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
  }

  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}
          />
        </span>
      )}
      {label}
    </span>
  )
}
