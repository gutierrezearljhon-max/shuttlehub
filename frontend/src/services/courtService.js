import api from './api';

const courtService = {
  getAllCourts: async () => {
    const response = await api.get('/courts');
    return response.data;
  },

  getAvailableCourts: async () => {
    const response = await api.get('/courts/available');
    return response.data;
  },

  getCourtById: async (id) => {
    const response = await api.get(`/courts/${id}`);
    return response.data;
  },

  createCourt: async (courtData) => {
    const response = await api.post('/courts', courtData);
    return response.data;
  },

  updateCourt: async (id, courtData) => {
    const response = await api.put(`/courts/${id}`, courtData);
    return response.data;
  },

  deleteCourt: async (id) => {
    const response = await api.delete(`/courts/${id}`);
    return response.data;
  },

  updateCourtStatus: async (id, status) => {
    const response = await api.put(`/courts/${id}/status`, { status });
    return response.data;
  }
};

export default courtService;