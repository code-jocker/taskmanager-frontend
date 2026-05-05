import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gov-light">
      <Sidebar />
      <Topbar title={title} subtitle={subtitle} />
      <main className="ml-60 pt-14 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
