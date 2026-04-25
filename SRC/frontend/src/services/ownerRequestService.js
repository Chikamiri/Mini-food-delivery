import api from '@/services/api'

export default {
  async submitRequest(payload) {
    return api.post('/api/owner-requests', payload)
  },

  async getMyRequests() {
    return api.get('/api/owner-requests/my')
  },

  async getPendingRequests() {
    return api.get('/api/owner-requests/pending')
  },

  async processRequest(requestId, approved, adminNote = '') {
    return api.put(`/api/owner-requests/${requestId}/process`, {
      approved: Boolean(approved),
      adminNote: adminNote || null,
    })
  },
}
