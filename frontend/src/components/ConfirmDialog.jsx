import { AlertTriangle } from 'lucide-react'
import Modal from './Modal.jsx'

/**
 * Confirmation dialog for destructive actions.
 *
 * Usage:
 *   <ConfirmDialog
 *     isOpen={showDelete}
 *     onClose={() => setShowDelete(false)}
 *     onConfirm={handleDelete}
 *     title="Delete product?"
 *     message="This action cannot be undone."
 *     confirmLabel="Delete"
 *     danger
 *   />
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        {danger && (
          <div className={`w-10 h-10 rounded-full ${danger ? 'bg-red-500/20' : 'bg-accent-blue/20'} flex items-center justify-center shrink-0`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-accent-blue'}`} />
          </div>
        )}
        <p className="text-sm text-slate-300 leading-relaxed pt-2">{message}</p>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="btn-secondary py-2 px-4 text-sm"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`py-2 px-4 text-sm font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            danger
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-accent-blue hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
