import { createContext, useContext, useState, useCallback } from 'react'

const NotifContext = createContext(null)

// Mock notifications — replace with Socket.io events in production
const MOCK = [
  { id: 1, type: 'task',     title: 'New Task Assigned',        body: 'Algebra Assignment 1 is due Feb 15', time: '2m ago',  read: false },
  { id: 2, type: 'approval', title: 'Organization Approved',    body: 'Test School has been approved',      time: '1h ago',  read: false },
  { id: 3, type: 'reminder', title: 'Deadline Reminder',        body: 'Physics project due tomorrow',       time: '3h ago',  read: true  },
  { id: 4, type: 'task',     title: 'Submission Graded',        body: 'Your Math assignment scored 85/100', time: '1d ago',  read: true  },
]

export function NotifProvider({ children }) {
  const [notifications, setNotifications] = useState(MOCK)

  const unread = notifications.filter(n => !n.read).length

  const markRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), read: false }, ...prev])
  }, [])

  return (
    <NotifContext.Provider value={{ notifications, unread, markRead, markAllRead, addNotification }}>
      {children}
    </NotifContext.Provider>
  )
}

export const useNotif = () => useContext(NotifContext)
