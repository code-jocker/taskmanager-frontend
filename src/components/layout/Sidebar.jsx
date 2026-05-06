import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, BookOpen, ClipboardList,
  BarChart3, CreditCard, LogOut, ChevronRight, GraduationCap,
  Briefcase, Settings, FileText, CheckSquare
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const NAV = {
  district_admin: [
    { to: '/district',              icon: LayoutDashboard, label: 'Dashboard'      },
    { to: '/district/organizations',icon: Building2,       label: 'Organizations'  },
    { to: '/district/analytics',    icon: BarChart3,       label: 'Analytics'      },
    { to: '/district/payments',     icon: CreditCard,      label: 'Payments'       },
  ],
  organization_admin: [
    { to: '/org',           icon: LayoutDashboard, label: 'Dashboard'    },
    { to: '/org/users',     icon: Users,           label: 'Staff & Users'},
    { to: '/org/classes',   icon: BookOpen,        label: 'Classes'      },
    { to: '/org/import',    icon: FileText,        label: 'Import Data'  },
    { to: '/org/analytics', icon: BarChart3,       label: 'Analytics'    },
  ],
  teacher: [
    { to: '/teacher',            icon: LayoutDashboard, label: 'Dashboard'   },
    { to: '/teacher/tasks',      icon: ClipboardList,   label: 'My Tasks'    },
    { to: '/teacher/create-task',icon: CheckSquare,     label: 'Create Task' },
    { to: '/teacher/classes',    icon: BookOpen,        label: 'My Classes'  },
  ],
  worker: [
    { to: '/teacher',            icon: LayoutDashboard, label: 'Dashboard'   },
    { to: '/teacher/tasks',      icon: ClipboardList,   label: 'My Tasks'    },
    { to: '/teacher/create-task',icon: CheckSquare,     label: 'Create Task' },
    { to: '/teacher/classes',    icon: Briefcase,       label: 'Departments' },
  ],
  student: [
    { to: '/student',         icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/student/tasks',   icon: ClipboardList,   label: 'My Tasks'   },
    { to: '/student/results', icon: BarChart3,       label: 'My Results' },
  ],
  intern: [
    { to: '/student',         icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/student/tasks',   icon: ClipboardList,   label: 'My Tasks'   },
    { to: '/student/results', icon: BarChart3,       label: 'My Results' },
  ],
}

const ROLE_LABELS = {
  district_admin:    'District Admin',
  organization_admin:'Org Admin',
  teacher:           'Teacher',
  worker:            'Worker',
  student:           'Student',
  intern:            'Intern',
}

export default function Sidebar() {
  const { user, logout, role } = useAuth()
  const navigate = useNavigate()
  const links = NAV[role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-primary-900 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gov-gold rounded-md flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Rwanda TMS</p>
            <p className="text-blue-300 text-xs">Task Management</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gov-gold/20 border border-gov-gold/40 flex items-center justify-center flex-shrink-0">
            <span className="text-gov-gold text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name || 'User'}</p>
            <p className="text-blue-300 text-xs">{ROLE_LABELS[role] || role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive')
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/10 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive')
          }
        >
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="sidebar-link sidebar-link-inactive w-full text-left hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
