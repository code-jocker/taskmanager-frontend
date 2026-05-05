import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Search, Trash2, Edit2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, DataTable, Modal, SectionHeader, Pagination } from '../../components/ui/index.jsx'
import { userAPI } from '../../services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const schema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  phone:    z.string().optional(),
  role:     z.enum(['teacher', 'worker', 'organization_admin']),
})

const ROLE_FILTERS = ['all', 'organization_admin', 'teacher', 'worker', 'student', 'intern']

export default function UsersPage() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [modal, setModal]     = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filter !== 'all') params.role = filter
      const { data } = await userAPI.getAll(params)
      setUsers(data.data || [])
      setPages(data.pagination?.pages || 1)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }, [filter, page])

  useEffect(() => { load() }, [load])

  const onCreate = async (values) => {
    setSubmitting(true)
    try {
      await userAPI.create(values)
      toast.success('User created successfully')
      setModal(false)
      reset()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    } finally { setSubmitting(false) }
  }

  const onDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    try {
      await userAPI.remove(id)
      toast.success('User deleted')
      load()
    } catch { toast.error('Failed to delete user') }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name',  label: 'User',
      render: r => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{r.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-400">{r.email}</p>
          </div>
        </div>
      )
    },
    { key: 'phone',  label: 'Phone',  render: r => <span className="text-xs text-gray-500">{r.phone || '—'}</span> },
    { key: 'role',   label: 'Role',   render: r => <Badge status={r.role} /> },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'created_at', label: 'Added',
      render: r => <span className="text-xs text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</span>
    },
    { key: 'actions', label: '',
      render: r => (
        <div className="flex gap-1">
          <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-900 transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(r.id, r.name)} className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      )
    },
  ]

  return (
    <DashboardLayout title="Staff & Users" subtitle="Manage teachers, workers, and admins">
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input pl-9" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ROLE_FILTERS.map(r => (
              <button key={r} onClick={() => { setFilter(r); setPage(1) }}
                className={clsx('px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-colors',
                  filter === r ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >{r}</button>
            ))}
          </div>
          <button onClick={() => { reset(); setModal(true) }} className="btn-primary text-xs py-1.5 px-3 flex-shrink-0">
            <UserPlus size={13} /> Add User
          </button>
        </div>

        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No users found" />
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create New User">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('name')} placeholder="John Doe" className="input" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Role *</label>
              <select {...register('role')} className="input">
                <option value="teacher">Teacher</option>
                <option value="worker">Worker</option>
                <option value="organization_admin">Org Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input {...register('email')} type="email" placeholder="user@org.rw" className="input" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password *</label>
              <input {...register('password')} type="password" placeholder="Min 6 chars" className="input" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} placeholder="+250 788 000 000" className="input" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
