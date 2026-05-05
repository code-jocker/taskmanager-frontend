import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Alert, SectionHeader } from '../../components/ui/index.jsx'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ImportPage() {
  const [file, setFile]         = useState(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult]     = useState(null)
  const inputRef                = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const processFile = (f) => {
    const allowed = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    if (!allowed.includes(f.type) && !f.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error('Only CSV or Excel files are allowed')
      return
    }
    setFile(f)
    setResult(null)
    // Mock preview
    setPreview({
      total: 42,
      valid: 39,
      invalid: 3,
      sample: [
        { id: 'STD001', name: 'Alice Uwimana',  email: 'alice@school.rw', role: 'student', status: 'valid'   },
        { id: 'STD002', name: 'Bob Nkurunziza', email: 'bob@school.rw',   role: 'student', status: 'valid'   },
        { id: 'STD003', name: 'Carol Mukamana', email: '',                 role: 'student', status: 'invalid' },
      ]
    })
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await userAPI.bulkImport(form)
      setResult({ success: true, imported: preview.valid, failed: preview.invalid })
      toast.success(`${preview.valid} records imported successfully`)
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Import failed' })
      toast.error('Import failed')
    } finally {
      setUploading(false)
    }
  }

  const reset = () => { setFile(null); setPreview(null); setResult(null) }

  return (
    <DashboardLayout title="Import Data" subtitle="Bulk import students or employees via CSV/Excel">
      <div className="max-w-3xl">
        {/* Template download */}
        <div className="card mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Download Template</p>
            <p className="text-xs text-gray-500 mt-0.5">Use our template to ensure correct formatting</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Download size={13} /> Students CSV
            </button>
            <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Download size={13} /> Employees CSV
            </button>
          </div>
        </div>

        {/* Drop zone */}
        {!file && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={clsx(
              'card border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-14 transition-all',
              dragging ? 'border-primary-900 bg-primary-50' : 'border-gray-300 hover:border-primary-900 hover:bg-gray-50'
            )}
          >
            <Upload size={32} className={clsx('mb-3', dragging ? 'text-primary-900' : 'text-gray-400')} />
            <p className="text-sm font-semibold text-gray-700">Drop your file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">Supports CSV, XLS, XLSX · Max 10MB</p>
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => processFile(e.target.files[0])} />
          </div>
        )}

        {/* Preview */}
        {preview && !result && (
          <div className="card">
            <SectionHeader
              title="File Preview"
              subtitle={file?.name}
              action={<button onClick={reset} className="btn-secondary text-xs py-1.5 px-3">Change File</button>}
            />

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{preview.total}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Records</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gov-green">{preview.valid}</p>
                <p className="text-xs text-gray-500 mt-0.5">Valid</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-600">{preview.invalid}</p>
                <p className="text-xs text-gray-500 mt-0.5">Invalid</p>
              </div>
            </div>

            {preview.invalid > 0 && (
              <Alert type="warning" message={`${preview.invalid} records have errors and will be skipped. Fix them in your file and re-upload for complete import.`} />
            )}

            {/* Sample rows */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="table-header">ID</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {preview.sample.map((row, i) => (
                    <tr key={i} className={row.status === 'invalid' ? 'bg-red-50/50' : ''}>
                      <td className="table-cell font-mono">{row.id}</td>
                      <td className="table-cell">{row.name}</td>
                      <td className="table-cell text-gray-500">{row.email || <span className="text-red-500">Missing</span>}</td>
                      <td className="table-cell capitalize">{row.role}</td>
                      <td className="table-cell">
                        {row.status === 'valid'
                          ? <CheckCircle size={14} className="text-emerald-500" />
                          : <XCircle    size={14} className="text-red-500"     />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">Showing 3 of {preview.total} records</p>
            </div>

            <div className="flex justify-end mt-5">
              <button onClick={handleUpload} disabled={uploading} className="btn-primary px-6">
                {uploading ? 'Importing...' : `Import ${preview.valid} Valid Records`}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="card text-center py-10">
            {result.success ? (
              <>
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-gray-900">Import Successful</p>
                <p className="text-sm text-gray-500 mt-1">{result.imported} records imported · {result.failed} skipped</p>
                <button onClick={reset} className="btn-primary mt-5 px-6">Import Another File</button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={28} className="text-red-600" />
                </div>
                <p className="font-semibold text-gray-900">Import Failed</p>
                <p className="text-sm text-gray-500 mt-1">{result.message}</p>
                <button onClick={reset} className="btn-secondary mt-5 px-6">Try Again</button>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
