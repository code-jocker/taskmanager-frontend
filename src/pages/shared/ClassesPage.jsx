import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, DataTable, Modal, Pagination, Alert } from '../../components/ui/index.jsx'
import { classAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
  name:         z.string().min(2, 'Name required'),
  code:         z.string().min(2, 'Code required').max(20),
  type:         z.enum(['class', 'department']),
  max_students: z.coerce.number().min(1).max(500).optional(),
  description:  z.string().optional(),
})

export default function ClassesPage() {
  const { role } = useAuth()
  const isOrgAdmin = role === 'organization_admin'

  const [classes, setClasses]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [pages, setPages]           = useState(1)
  const [modal, setModal]           = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'class', max_students: 40 }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await classAPI.getAll({ page, limit: 10 })
      setClasses(data.data || [])
      setPages(data.pagination?.pages || 1)
    } catch {
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  const openCreate = () => { reset({ type: 'class', max_students: 40 }); setError(''); setModal('create') }
  const openEdit   = (c)  => { reset(c); setError(''); setModal({ edit: c }) }

  const onSubmit = async (values) => {
    setSubmitting(true); setError('')
    try {
      if (modal?.edit) {
        await classAPI.update(modal.edit.id, values)
        toast.success('Class updated')
      } else {
        await classAPI.create(values)
        toast.success('Class created')
      }
      setModal(null); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed')
    } finally { setSubmitting(false) }
  }

  const onDelete = async () => {
    setSubmitting(true)
    try {
      await classAPI.remove(modal.delete.id)
      toast.success('Class deleted')
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally { setSubmitting(false) }
  }

  const filtered = classes.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name', label: 'Name',
      render: r => <div><p className="text-sm font-medium text-gray-900">{r.name}</p><p className="text-xs text-gray-400">{r.code}</p></div>
    },
    { key: 'type',             label: 'Type',     render: r => <span className="capitalize text-xs">{r.type}</span> },
    { key: 'current_students', label: 'Students', render: r => <span className="text-sm font-semibold">{r.current_students ?? 0} / {r.max_students ?? '—'}</span> },
    { key: 'status',           label: 'Status',   render: r => <Badge status={r.status} /> },
    ...(isOrgAdmin ? [{
      key: 'actions', label: '',
      render: r => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => setModal({ delete: r })} className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
        </div>
      )
    }] : []),
  ]

  return (
    <DashboardLayout
      title={isOrgAdmin ? 'Classes & Departments' : 'My Classes'}
      subtitle="Manage classes and departments"
    >
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search classes..." className="input pl-9" />
          </div>
          {isOrgAdmin && (
            <button onClick={openCreate} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Plus size={13} /> New Class
            </button>
          )}
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No classes found" />
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>

      <Modal open={modal === 'create' || !!modal?.edit} onClose={() => setModal(null)} title={modal?.edit ? 'Edit Class' : 'Create Class'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert type="error" message={error} />}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input {...register('name')} placeholder="e.g. Mathematics Grade 10" className="input" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Code *</label>
              <input {...register('code')} placeholder="e.g. MATH10" className="input" />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="label">Type *</label>
              <select {...register('type')} className="input">
                <option value="class">Class</option>
                <option value="department">Department</option>
              </select>
            </div>
            <div>
              <label className="label">Max Students</label>
              <input {...register('max_students')} type="number" className="input" />
            </div>
            <div>
              <label className="label">Description</label>
              <input {...register('description')} placeholder="Optional" className="input" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : modal?.edit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!modal?.delete} onClose={() => setModal(null)} title="Delete Class">
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete <strong>{modal?.delete?.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={onDelete} disabled={submitting} className="btn-danger">
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
