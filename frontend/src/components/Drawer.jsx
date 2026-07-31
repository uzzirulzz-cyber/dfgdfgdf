import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Slide-in drawer from the right edge. Used for detail views (order details,
 * customer profile) that don't deserve a full page navigation.
 *
 * Usage:
 *   <Drawer isOpen={open} onClose={close} title="Order #1234">
 *     ...detail content...
 *   </Drawer>
 */
const Drawer = ({ isOpen, onClose, title, children, width = 'max-w-2xl' }) => {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`absolute right-0 top-0 bottom-0 w-full ${width} bg-surface border-l border-white/10 shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Drawer
