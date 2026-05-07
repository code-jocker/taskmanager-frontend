import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://taskmanager-backend-1-9yaq.onrender.com'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only auto-redirect on 401 for authenticated requests (not login endpoints)
    const url = err.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/district-admin/login') || url.includes('/auth/organization-login')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:              (data) => api.post('/auth/login', data),
  districtAdminLogin: (data) => api.post('/auth/district-admin/login', data),
  orgCodeLogin:       (data) => api.post('/auth/organization-login', data),
  getProfile:         ()     => api.get('/auth/profile'),
  logout:             ()     => api.post('/auth/logout'),
  changePassword:     (data) => api.put('/auth/change-password', data),
}

export const districtAPI = {
  getPending: ()         => api.get('/district/organizations/pending'),
  getAll:     (params)   => api.get('/district/organizations', { params }),
  approve:    (id, data) => api.put(`/district/organizations/approve/${id}`, data),
  reject:     (id, data) => api.put(`/district/organizations/reject/${id}`, data),
  suspend:    (id, data) => api.put(`/district/organizations/suspend/${id}`, data),
  getStats:   ()         => api.get('/district/stats'),
  getPayments:(params)   => api.get('/district/payments', { params }),
}

export const orgAPI = {
  getDistricts:  ()       => api.get('/organizations/districts'),
  checkCode:     (code)   => api.get(`/organizations/check-code/${code}`),
  checkMyStatus: (email)  => api.get('/organizations/my-status', { params: { email } }),
  setupAccount:  (data)   => api.post('/organizations/setup-account', data),
  register:      (data)   => api.post('/organizations/register', data),
  getProfile:    ()       => api.get('/organizations/profile'),
  updateProfile: (data)   => api.put('/organizations/profile', data),
  getStats:      ()       => api.get('/organizations/stats'),
}

export const userAPI = {
  create:         (data)           => api.post('/users', data),
  getAll:         (params)         => api.get('/users', { params }),
  getById:        (id)             => api.get(`/users/${id}`),
  update:         (id, d)          => api.put(`/users/${id}`, d),
  remove:         (id)             => api.delete(`/users/${id}`),
  bulkImport:     (form)           => api.post('/users/bulk-import', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStudentDashboard: ()          => api.get('/users/student/dashboard'),
}

export const classAPI = {
  create:        (data)              => api.post('/classes', data),
  getAll:        (params)            => api.get('/classes', { params }),
  getById:       (id)                => api.get(`/classes/${id}`),
  update:        (id, d)             => api.put(`/classes/${id}`, d),
  remove:        (id)                => api.delete(`/classes/${id}`),
  getStats:      (id)                => api.get(`/classes/${id}/stats`),
  addStudent:    (id, student_id)    => api.post(`/classes/${id}/students`, { student_id }),
  removeStudent: (id, studentId)     => api.delete(`/classes/${id}/students/${studentId}`),
  addSubject:    (id, data)          => api.post(`/classes/${id}/subjects`, data),
}

export const taskAPI = {
  create:         (data)         => api.post('/tasks', data),
  getAll:         (params)       => api.get('/tasks', { params }),
  getById:        (id)           => api.get(`/tasks/${id}`),
  update:         (id, d)        => api.put(`/tasks/${id}`, d),
  remove:         (id)           => api.delete(`/tasks/${id}`),
  submit:         (id, form)     => api.post(`/tasks/${id}/submit`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  grade:          (id, subId, d) => api.put(`/tasks/${id}/submissions/${subId}/grade`, d),
  getSubmissions: (id)           => api.get(`/tasks/${id}/submissions`),
}

export default api
