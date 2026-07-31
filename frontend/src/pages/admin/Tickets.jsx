import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MessageCircle, CheckCircle, Loader2, Ticket, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import Drawer from '../../components/Drawer.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const statusColors = {
  open: 'bg-yellow-500/10 text-yellow-400',
  in_progress: 'bg-blue-500/10 text-blue-400',
  waiting: 'bg-orange-500/10 text-orange-400',
  resolved: 'bg-green-500/10 text-green-400',
  closed: 'bg-slate-500/10 text-slate-400',
}

const priorityColors = {
  low: 'bg-slate-500/10 text-slate-400',
  medium: 'bg-blue-500/10 text-blue-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
}

const AdminTickets = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [reply, setReply] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      const { data } = await api.get(`/tickets/admin/all?${params}`)
      return data
    },
  })

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-ticket', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${selectedId}`)
      return data
    },
  })

  const updateTicket = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/tickets/admin/${id}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['admin-ticket'] })
      toast.success('Ticket updated')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  })

  const replyMutation = useMutation({
    mutationFn: async ({ id, message }) => {
      const { data } = await api.post(`/tickets/admin/${id}/reply`, { message })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket'] })
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      toast.success('Reply sent')
      setReply('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reply'),
  })

  const tickets = data?.data || []
  const ticket = detailData?.data

  const sendReply = (e) => {
    e.preventDefault()
    if (!reply.trim() || !ticket) return
    replyMutation.mutate({ id: ticket._id, message: reply })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-sm text-slate-500 mt-1">Reply to customer support requests and manage ticket status</p>
      </div>

      <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject, ticket number, or customer…"
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input-field py-2 text-sm sm:w-48">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass rounded-xl">
          <EmptyState
            icon={Ticket}
            title="No support tickets"
            message="When customers submit support requests, they'll show up here for you to respond to."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(t => (
            <div
              key={t._id}
              onClick={() => setSelectedId(t._id)}
              className="glass rounded-xl p-6 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-500">{t.ticketNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[t.status] || statusColors.open}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColors[t.priority] || priorityColors.low}`}>
                      {t.priority}
                    </span>
                  </div>
                  <h3 className="font-semibold truncate">{t.subject}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
                <span>By {t.customer?.name || '—'}</span>
                <div className="flex items-center gap-3">
                  {(t.replies?.length || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {t.replies.length}
                    </span>
                  )}
                  {t.status !== 'resolved' && t.status !== 'closed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateTicket.mutate({ id: t._id, updates: { status: 'resolved' } })
                      }}
                      className="flex items-center gap-1 text-slate-400 hover:text-green-400 transition-colors"
                      title="Mark resolved"
                    >
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer with reply box */}
      <Drawer
        isOpen={!!selectedId}
        onClose={() => { setSelectedId(null); setReply('') }}
        title={ticket ? `Ticket ${ticket.ticketNumber}` : 'Loading…'}
        width="max-w-2xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : !ticket ? null : (
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[ticket.status]}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
              <h2 className="text-lg font-semibold">{ticket.subject}</h2>
              <p className="text-sm text-slate-400 mt-1">{ticket.description}</p>
              <div className="text-xs text-slate-500 mt-3">
                Opened by {ticket.customer?.name} · {new Date(ticket.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Status controls */}
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <label className="block text-xs font-medium text-slate-400 mb-2">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusColors).map(([s, color]) => (
                  <button
                    key={s}
                    onClick={() => updateTicket.mutate({ id: ticket._id, updates: { status: s } })}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                      ticket.status === s ? `${color} ring-2 ring-offset-2 ring-offset-slate-900 ring-current` : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Conversation</h4>
              <div className="space-y-3">
                {(ticket.replies || []).map((r, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm ${
                      r.author?.role && r.author.role !== 'customer'
                        ? 'bg-accent-blue/10 border border-accent-blue/20 ml-8'
                        : 'bg-slate-800/40 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-xs text-slate-400">
                      <span className="font-medium">{r.author?.name || 'Unknown'}{r.author?.role && r.author.role !== 'customer' ? ' (Staff)' : ''}</span>
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200 whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
                {(!ticket.replies || ticket.replies.length === 0) && (
                  <p className="text-sm text-slate-500 italic">No replies yet — be the first to respond.</p>
                )}
              </div>
            </div>

            {/* Reply box */}
            {ticket.status !== 'closed' && (
              <form onSubmit={sendReply} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Reply</label>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={4}
                  placeholder="Type your response to the customer…"
                  className="input-field py-2 text-sm resize-y"
                  disabled={replyMutation.isPending}
                />
                <div className="flex justify-end gap-2">
                  {ticket.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => {
                        updateTicket.mutate({ id: ticket._id, updates: { status: 'resolved' } })
                      }}
                      className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                      disabled={updateTicket.isPending}
                    >
                      <CheckCircle className="w-4 h-4" /> Resolve
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!reply.trim() || replyMutation.isPending}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                  >
                    {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Reply
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AdminTickets
