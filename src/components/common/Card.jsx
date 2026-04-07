/**
 * Card - Reusable card wrapper component with consistent styling.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hover] - Enable hover lift effect
 */
export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-4 ${hover ? 'card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
