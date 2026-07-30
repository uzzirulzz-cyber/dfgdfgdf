import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Ticket, Plus, MessageCircle, Clock } from 'lucide-react'
import api from '../services/api.js'

const statusColors = {
  open: 'text-yellow-400',
  in_progress: 'text-blue-400',
  waiting: 'text-orange-400',
  resolved: 'text-green-400',
  closed: 'text-slate-400',
}

const TicketsPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ category: 'general', subject: '', description: '' })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const { data } = await api.get('/tickets')
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (ticketData) => {
      const { data } = await api.post('/tickets', ticketData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
      setShowForm(false)
      setFormData({ category: 'general', subject: '', description: '' })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="input-field">
              <option value="general">General</option>
              <option value="order_issue">Order Issue</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="product_issue">Product Issue</option>
              <option value="delivery_issue">Delivery Issue</option>
              <option value="refund_request">Refund Request</option>
              <option value="account_issue">Account Issue</option>
              <option value="technical_support">Technical Support</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
            <input type="text" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="input-field min-h-[120px]" required />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent mx-auto" /></div>
      ) : (!data?.data || data.data.length === 0) ? (
        <div className="text-center py-20">
          <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Tickets</h2>
          <p className="text-slate-400">You haven't created any support tickets yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map(ticket => (
            <div key={ticket._id} className="glass rounded-xl p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-slate-500">{ticket.ticketNumber}</span>
                  <span className={`text-sm font-medium capitalize ${statusColors[ticket.status] || 'text-slate-400'}`}>{ticket.status.replace('_', ' ')}</span>
                </div>
                <span className="text-xs text-slate-600">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-semibold mb-2">{ticket.subject}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-3">{ticket.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {ticket.messages?.length || 0} replies</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ticket.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TicketsPage
