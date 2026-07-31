import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Pagination control. Expects a `pagination` object from the API:
 *   { page, limit, total, pages }
 *
 * Usage:
 *   <Pagination pagination={data?.pagination} onPage={setPage} />
 */
const Pagination = ({ pagination, onPage, isLoading = false }) => {
  if (!pagination) return null
  const { page, pages, total } = pagination
  if (total === 0) return null

  // Show at most 5 page buttons around the current page
  const start = Math.max(1, page - 2)
  const end = Math.min(pages, start + 4)
  const range = []
  for (let i = start; i <= end; i++) range.push(i)

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-white/5">
      <div className="text-xs text-slate-500">
        Showing page <span className="text-slate-300">{page}</span> of{' '}
        <span className="text-slate-300">{pages}</span> · {total} total
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1 || isLoading}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {start > 1 && (
          <>
            <button onClick={() => onPage(1)} className="px-3 py-1 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5">1</button>
            {start > 2 && <span className="px-1 text-slate-500">…</span>}
          </>
        )}
        {range.map(p => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-accent-blue text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {p}
          </button>
        ))}
        {end < pages && (
          <>
            {end < pages - 1 && <span className="px-1 text-slate-500">…</span>}
            <button onClick={() => onPage(pages)} className="px-3 py-1 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5">{pages}</button>
          </>
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages || isLoading}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
