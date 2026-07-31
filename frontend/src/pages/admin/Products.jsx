import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Eye, Package, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import Modal from '../../components/Modal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import Pagination from '../../components/Pagination.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: '',
  salePrice: '',
  sku: '',
  category: '',
  status: 'active',
  type: 'digital',
  unlimitedStock: true,
  stockQuantity: '0',
  images: '',
}

const statusOptions = [
  { value: 'active', label: 'Active', color: 'bg-green-500/10 text-green-400' },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-500/10 text-yellow-400' },
  { value: 'archived', label: 'Archived', color: 'bg-slate-500/10 text-slate-400' },
]

const AdminProducts = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.append('search', search)
      const { data } = await api.get(`/products?${params}`)
      return data
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await api.get('/products/categories')
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, payload)
        return data
      }
      const { data } = await api.post('/products', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success(editingId ? 'Product updated' : 'Product created')
      setModalOpen(false)
      setEditingId(null)
      setForm(emptyForm)
      setErrors({})
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save product')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/products/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product deleted')
      setDeleteTarget(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete product')
    },
  })

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price?.toString() || '',
      salePrice: product.salePrice?.toString() || '',
      sku: product.sku || '',
      category: product.category?._id || product.category || '',
      status: product.status || 'active',
      type: product.type || 'digital',
      unlimitedStock: product.unlimitedStock ?? true,
      stockQuantity: product.stockQuantity?.toString() || '0',
      images: product.images?.map(i => i.url).join('\n') || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.sku.trim()) e.sku = 'SKU is required'
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)
      e.price = 'Valid price is required'
    if (form.salePrice && parseFloat(form.salePrice) >= parseFloat(form.price))
      e.salePrice = 'Sale price must be less than regular price'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = {
      ...form,
      price: parseFloat(form.price),
      salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      images: form.images
        .split('\n').map(s => s.trim()).filter(Boolean)
        .map(url => ({ url, alt: form.name })),
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      category: form.category || undefined,
    }
    createMutation.mutate(payload)
  }

  const onField = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }))
  }

  const products = data?.data || []
  const pagination = data?.pagination

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your product catalog</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="glass rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, SKU, or slug…"
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
          />
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            message="Create your first product to start selling. Add a name, price, and category, and you're ready to go."
            action={<button onClick={openCreate} className="btn-primary py-2 px-4 text-sm">Add Product</button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-white/5">
                    <th className="p-4 font-medium">Product</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Stock</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const statusMeta = statusOptions.find(s => s.value === product.status) || statusOptions[2]
                    return (
                      <tr key={product._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                              {product.images?.[0]?.url ? (
                                <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{product.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">{product.category?.name || '—'}</td>
                        <td className="p-4">
                          <span className="font-medium">${(product.salePrice || product.price)?.toFixed(2)}</span>
                          {product.salePrice && (
                            <span className="text-xs text-slate-500 line-through ml-2">${product.price.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-4">{product.unlimitedStock ? '∞' : product.stockQuantity}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusMeta.color}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/products/${product.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-slate-400 hover:text-accent-blue rounded-lg transition-colors"
                              title="View on storefront"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => openEdit(product)}
                              className="p-2 text-slate-400 hover:text-accent-blue rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-2 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={setPage} isLoading={isLoading} />
          </>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Product' : 'New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={onField('name')}
                className="input-field py-2 text-sm"
                placeholder="e.g. Pro Audio Bundle"
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">SKU *</label>
              <input
                type="text"
                value={form.sku}
                onChange={onField('sku')}
                className="input-field py-2 text-sm font-mono"
                placeholder="PB-001"
              />
              {errors.sku && <p className="text-xs text-red-400 mt-1">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={onField('category')}
                className="input-field py-2 text-sm"
              >
                <option value="">— None —</option>
                {(categoriesData?.data || []).map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={onField('price')}
                className="input-field py-2 text-sm"
                placeholder="49.99"
              />
              {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Sale Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.salePrice}
                onChange={onField('salePrice')}
                className="input-field py-2 text-sm"
                placeholder="39.99 (optional)"
              />
              {errors.salePrice && <p className="text-xs text-red-400 mt-1">{errors.salePrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
              <select value={form.status} onChange={onField('status')} className="input-field py-2 text-sm">
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
              <select value={form.type} onChange={onField('type')} className="input-field py-2 text-sm">
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Short Description</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={onField('shortDescription')}
                className="input-field py-2 text-sm"
                placeholder="One-line summary shown on product cards"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={onField('description')}
                rows={4}
                className="input-field py-2 text-sm resize-y"
                placeholder="Full product description (markdown supported)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Image URLs (one per line)</label>
              <textarea
                value={form.images}
                onChange={onField('images')}
                rows={3}
                className="input-field py-2 text-sm font-mono resize-y"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
              <input
                type="checkbox"
                id="unlimitedStock"
                checked={form.unlimitedStock}
                onChange={onField('unlimitedStock')}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-accent-blue focus:ring-accent-blue"
              />
              <label htmlFor="unlimitedStock" className="text-sm text-slate-300">Unlimited stock (digital products)</label>
            </div>

            {!form.unlimitedStock && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={onField('stockQuantity')}
                  className="input-field py-2 text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary py-2 px-4 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This permanently removes the product from your catalog. Existing orders that reference it will keep their historical data."
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export default AdminProducts
