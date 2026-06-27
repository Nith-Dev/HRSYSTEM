import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isLoginCall = err.config?.url?.includes('/auth/login')
      if (!isLoginCall) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats'),
}

export const departmentApi = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
}

export const officeApi = {
  getAll: (params) => api.get('/offices', { params }),
  create: (data) => api.post('/offices', data),
  update: (id, data) => api.put(`/offices/${id}`, data),
  delete: (id) => api.delete(`/offices/${id}`),
}

export const rankApi = {
  getAll: () => api.get('/ranks'),
  create: (data) => api.post('/ranks', data),
  update: (id, data) => api.put(`/ranks/${id}`, data),
  delete: (id) => api.delete(`/ranks/${id}`),
}

export const educationApi = {
  getAll: () => api.get('/education-levels'),
  create: (data) => api.post('/education-levels', data),
  update: (id, data) => api.put(`/education-levels/${id}`, data),
  delete: (id) => api.delete(`/education-levels/${id}`),
}

export default api
