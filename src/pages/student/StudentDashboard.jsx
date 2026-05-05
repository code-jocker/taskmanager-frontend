import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, Badge, SectionHeader } from '../../components/ui/index.jsx'
import { taskAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

function isOverdue(dateStr) {
  return dateStr && new Date(dateStr) < new Date()
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    taskAPI.getAll({ limit: 50 })
      .then(({ data }) => setTasks(data.data || []))
      .catch(() => setTasks([]))
  }, [])

  const pending   = tasks.filter(t => t.status === 'pending').length
  const submitted = tasks.filter(t => t.status === 'submitted').length
  const graded    = tasks.filter(t => t.status === 'graded').length
  const overdue   = tasks.filter(t => t.status === 'pending' && isOverdue(t.due_date)).length

  return (
    <DashboardLayout
      title="My Dashboard"
      subtitle={`${user?.organization?.name || ''} · ${user?.role === 'intern' ? 'Intern' : 'Student'}`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending Tasks"  value={pending}   icon={ClipboardList} color="blue"  />
        <StatCard label="Submitted"      value={submitted} icon={Clock}         color="gold"  />
        <StatCard label="Graded"         value={graded}    icon={CheckCircle}   color="green" />
        <StatCard label="Overdue"        value={overdue}   icon={AlertTriangle} color="red"   />
      </div>

      <div className="card">
        <SectionHeader title="My Tasks" subtitle="All assigned tasks" />
        <div className="space-y-2">
          {tasks.map(task => {
            const late = task.status === 'pending' && isOverdue(task.due_date)
            return (
              <Link
                key={task.id}
                to={`/student/tasks/${task.id}`}
                className={clsx(
                  'flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm',
                  late                        ? 'bg-red-50/60 border-red-200'     :
                  task.status === 'graded'    ? 'bg-emerald-50/60 border-emerald-200' :
                  task.status === 'submitted' ? 'bg-blue-50/60 border-blue-200'   :
                  'bg-white border-gray-100 hover:border-gray-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-2 h-10 rounded-full flex-shrink-0',
                    task.priority === 'urgent' ? 'bg-red-500'    :
                    task.priority === 'high'   ? 'bg-amber-500'  :
                    task.priority === 'medium' ? 'bg-primary-900':
                    'bg-gray-300'
                  )} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{task.subject}</span>
                      <span className="text-gray-300">·</span>
                      <span className={clsx('text-xs', late ? 'text-red-600 font-medium' : 'text-gray-500')}>
                        {late ? '⚠ Overdue · ' : 'Due: '}
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {task.score !== null && (
                    <span className="text-sm font-bold text-gov-green">{task.score}/100</span>
                  )}
                  <Badge status={task.status} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
