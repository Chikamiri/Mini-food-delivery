import api from '@/services/api'

export default {
  async submitRequest(payload) {
    return api.post('/api/shipper-requests', payload)
  },

  async getMyRequests() {
    return api.get('/api/shipper-requests/my')
  },

  async getPendingRequests() {
    return api.get('/api/shipper-requests/pending')
  },

  async processRequest(requestId, approved, adminNote = '') {
    return api.put(`/api/shipper-requests/${requestId}/process`, {
      approved: Boolean(approved),
      adminNote: adminNote || null,
    })
  },
}
