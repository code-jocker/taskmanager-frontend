import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, DataTable, Pagination } from '../../components/ui/index.jsx'
import { taskAPI } from '../../services/api'
import clsx from 'clsx'

const STATUS_FILTERS = ['all', 'draft', 'published', 'closed']

export default function TasksListPage() {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filter !== 'all') params.status = filter
      const { data } = await taskAPI.getAll(params)
      setTasks(data.data || [])
      setPages(data.pagination?.pages || 1)
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { load() }, [load])

  const filtered = tasks.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'title', label: 'Task',
      render: r => (
        <div>
          <p className="text-sm font-medium text-gray-900">{r.title}</p>
          <p className="text-xs text-gray-400 capitalize">{r.type} · {r.class?.name || '—'}</p>
        </div>
      )
    },
    { key: 'due_date', label: 'Due Date',
      render: r => <span className="text-xs text-gray-600">{r.due_date ? new Date(r.due_date).toLocaleDateString() : '—'}</span>
    },
    { key: 'priority', label: 'Priority', render: r => <Badge status={r.priority} /> },
    { key: 'status',   label: 'Status',   render: r => <Badge status={r.status} /> },
    { key: 'actions',  label: '',
      render: r => (
        <Link to={`/teacher/tasks/${r.id}`} className="text-xs text-primary-900 font-medium hover:underline">
          View Submissions →
        </Link>
      )
    },
  ]

  return (
    <DashboardLayout title="My Tasks" subtitle="All tasks you have created">
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="input pl-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => { setFilter(s); setPage(1) }}
                className={clsx(
                  'px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-colors',
                  filter === s ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >{s}</button>
            ))}
          </div>
          <Link to="/teacher/create-task" className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Plus size={13} /> New Task
          </Link>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No tasks found" />
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>
    </DashboardLayout>
  )
}
