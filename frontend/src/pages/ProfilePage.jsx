import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, Package, Ticket, Heart, LogOut } from 'lucide-react'
import useAuthStore from '../services/authStore.js'

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '' })

  const handleSave = async () => {
    await updateProfile(formData)
    setEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          <Link to="/orders" className="flex items-center gap-3 p-3 rounded-lg glass hover:bg-white/5 transition-colors">
            <Package className="w-5 h-5 text-accent-blue" /> My Orders
          </Link>
          <Link to="/tickets" className="flex items-center gap-3 p-3 rounded-lg glass hover:bg-white/5 transition-colors">
            <Ticket className="w-5 h-5 text-accent-orange" /> Support Tickets
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

        {/* Profile Info */}
        <div className="md:col-span-2 glass rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center">
              <User className="w-8 h-8 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="input-field" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-primary">Save Changes</button>
                <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                <User className="w-5 h-5 text-slate-500" />
                <div><div className="text-xs text-slate-500">Name</div><div>{user?.name}</div></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Mail className="w-5 h-5 text-slate-500" />
                <div><div className="text-xs text-slate-500">Email</div><div>{user?.email}</div></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Phone className="w-5 h-5 text-slate-500" />
                <div><div className="text-xs text-slate-500">Phone</div><div>{user?.phone || 'Not set'}</div></div>
              </div>
              <button onClick={() => setEditing(true)} className="btn-secondary">Edit Profile</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
