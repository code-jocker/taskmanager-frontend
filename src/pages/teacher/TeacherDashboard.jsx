import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, CheckSquare, Users, Clock, Plus } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, Badge, DataTable, SectionHeader, PageLoader } from '../../components/ui/index.jsx'
import { taskAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    taskAPI.getAll({ limit: 10 })
      .then(({ data }) => {
        // Ensure all task objects have proper structure
        const safeTasks = (data.data || []).map(task => ({
          ...task,
          class: task.class || { name: 'No Class' },
          title: task.title || 'Untitled Task'
        }))
        setTasks(safeTasks)
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [])

  const active  = tasks.filter(t => t.status === 'published').length
  const totalSub = tasks.reduce((s, t) => s + (t.total_submissions || 0), 0)
  const pending  = tasks.reduce((s, t) => s + (t.pending_grading || 0), 0)

  const columns = [
    { key: 'title', label: 'Task',
      render: r => <div><p className="text-sm font-medium text-gray-900">{r.title || 'Untitled Task'}</p><p className="text-xs text-gray-400">{r.class?.name || 'No Class'}</p></div>
    },
    { key: 'due_date', label: 'Due Date',
      render: r => <span className="text-xs text-gray-600">{new Date(r.due_date).toLocaleDateString()}</span>
    },
    { key: 'total_submissions', label: 'Submissions',
      render: r => <span className="text-sm font-semibold text-primary-900">{r.total_submissions}</span>
    },
    { key: 'priority', label: 'Priority', render: r => <Badge status={r.priority} /> },
    { key: 'status',   label: 'Status',   render: r => <Badge status={r.status} /> },
    { key: 'actions',  label: '',
      render: r => (
        <Link to={`/teacher/tasks/${r.id}`} className="text-xs text-primary-900 font-medium hover:underline">
          View →
        </Link>
      )
    },
  ]

  return (
    <DashboardLayout title="Teacher Dashboard" subtitle={`${user?.organization?.name || ''} · Teacher`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Tasks"      value={active}   icon={ClipboardList} color="blue"  />
        <StatCard label="Total Submissions" value={totalSub} icon={CheckSquare}   color="green" />
        <StatCard label="Pending Grading"   value={pending}  icon={Clock}         color="gold"  />
        <StatCard label="Total Tasks"       value={tasks.length} icon={Users}     color="gray"  />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="card lg:col-span-2">
          <SectionHeader title="Submission Overview" subtitle="Submitted vs total per task" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tasks.slice(0,6).map(t => ({ task: t.title?.slice(0,8) || 'Task', submitted: t.total_submissions || 0, total: 30 }))} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="task" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="submitted" fill="#1E3A8A" radius={[3,3,0,0]} name="Submitted" />
              <Bar dataKey="total"     fill="#E5E7EB" radius={[3,3,0,0]} name="Total"     />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card flex flex-col gap-3">
          <SectionHeader title="Quick Actions" />
          <Link to="/teacher/create-task" className="flex items-center gap-3 p-3 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors">
            <Plus size={16} />
            <span className="text-sm font-medium">Create New Task</span>
          </Link>
          <Link to="/teacher/tasks" className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <ClipboardList size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">View All Tasks</span>
          </Link>
          <Link to="/teacher/classes" className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <Users size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">My Classes</span>
          </Link>
        </div>
      </div>

      <div className="card">
        <SectionHeader
          title="My Tasks"
          action={<Link to="/teacher/create-task" className="btn-primary text-xs py-1.5 px-3"><Plus size={12} /> New Task</Link>}
        />
        <DataTable columns={columns} data={tasks} loading={loading} emptyMessage="No tasks yet" />
      </div>
    </DashboardLayout>
  )
}
