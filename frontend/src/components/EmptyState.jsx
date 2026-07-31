/**
 * Friendly empty-state placeholder for list views.
 *
 * Usage:
 *   <EmptyState
 *     icon={Package}
 *     title="No products yet"
 *     message="Create your first product to start selling."
 *     action={<button className="btn-primary">Add Product</button>}
 *   />
 */
const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
    )}
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-6">{message}</p>
    {action}
  </div>
)

export default EmptyState
