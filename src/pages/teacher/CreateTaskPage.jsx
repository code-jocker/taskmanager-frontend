import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Paperclip, Calendar, ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Alert, Spinner } from '../../components/ui/index.jsx'
import { taskAPI, classAPI } from '../../services/api'
import toast from 'react-hot-toast'

const schema = z.object({
  title:                   z.string().min(3, 'Title required'),
  description:             z.string().min(10, 'Description required'),
  instructions:            z.string().optional(),
  due_date:                z.string().min(1, 'Due date required'),
  class_id:                z.coerce.number().positive('Select a class'),
  priority:                z.enum(['low', 'medium', 'high', 'urgent']),
  type:                    z.enum(['assignment', 'project', 'quiz', 'exam', 'homework', 'task']),
  max_score:               z.coerce.number().min(1).max(1000),
  submission_type:         z.enum(['file', 'text', 'both']),
  late_submission_allowed: z.boolean(),
  late_penalty_percentage: z.coerce.number().min(0).max(100),
})

export default function CreateTaskPage() {
  const [classes, setClasses]   = useState([])
  const [error, setError]       = useState('')
  const navigate                = useNavigate()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'medium', type: 'assignment', max_score: 100,
      submission_type: 'both', late_submission_allowed: true, late_penalty_percentage: 10
    }
  })

  const lateAllowed = watch('late_submission_allowed')

  useEffect(() => {
    classAPI.getAll().then(({ data }) => setClasses(data.data || [])).catch(() => {})
  }, [])

  const onSubmit = async (values) => {
    setError('')
    try {
      const { data } = await taskAPI.create(values)
      toast.success(data.message || 'Task created successfully')
      navigate('/teacher/tasks')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task')
    }
  }

  return (
    <DashboardLayout title="Create Task" subtitle="Assign a new task to your class">
      <div className="max-w-2xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeft size={14} /> Back
        </button>

        <div className="card">
          {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <label className="label">Task Title *</label>
              <input {...register('title')} placeholder="e.g. Algebra Assignment 1" className="input" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            {/* Type + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Type *</label>
                <select {...register('type')} className="input">
                  {['assignment','project','quiz','exam','homework','task'].map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Priority *</label>
                <select {...register('priority')} className="input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Class + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Class / Department *</label>
                <select {...register('class_id')} className="input">
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.class_id && <p className="text-xs text-red-500 mt-1">{errors.class_id.message}</p>}
              </div>
              <div>
                <label className="label">Due Date *</label>
                <div className="relative">
                  <input {...register('due_date')} type="datetime-local" className="input pr-9" />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">Description *</label>
              <textarea {...register('description')} rows={3} placeholder="Describe the task..." className="input resize-none" />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            {/* Instructions */}
            <div>
              <label className="label">Instructions (optional)</label>
              <textarea {...register('instructions')} rows={2} placeholder="Step-by-step instructions..." className="input resize-none" />
            </div>

            {/* Submission settings */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Submission Settings</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Submission Type</label>
                  <select {...register('submission_type')} className="input">
                    <option value="both">File + Text</option>
                    <option value="file">File Only</option>
                    <option value="text">Text Only</option>
                  </select>
                </div>
                <div>
                  <label className="label">Max Score</label>
                  <input {...register('max_score')} type="number" className="input" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input {...register('late_submission_allowed')} type="checkbox" id="late" className="w-4 h-4 accent-primary-900" />
                <label htmlFor="late" className="text-sm text-gray-700">Allow late submissions</label>
              </div>
              {lateAllowed && (
                <div className="w-48">
                  <label className="label">Late Penalty (%)</label>
                  <input {...register('late_penalty_percentage')} type="number" min="0" max="100" className="input" />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary px-6">
                {isSubmitting ? <Spinner size="sm" /> : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
