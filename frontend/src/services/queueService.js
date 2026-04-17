import api from './api';

const queueService = {
  joinQueue: async (courtId, party = []) => {
    const response = await api.post(`/queue/${courtId}/join`, { party });
    return response.data;
  },

  leaveQueue: async (courtId) => {
    const response = await api.delete(`/queue/${courtId}/leave`);
    return response.data;
  },

  getQueueStatus: async (courtId) => {
    const response = await api.get(`/queue/${courtId}/status`);
    return response.data;
  },

  getNextPlayers: async (courtId, gameType = 'doubles') => {
    const response = await api.get(`/queue/${courtId}/next?type=${gameType}`);
    return response.data;
  },

  rotateQueue: async (courtId, winners, gameType = 'doubles') => {
    const response = await api.put(`/queue/${courtId}/rotate`, { winners, gameType });
    return response.data;
  },

  clearQueue: async (courtId) => {
    const response = await api.delete(`/queue/${courtId}/clear`);
    return response.data;
  },

  updateQueuePosition: async (courtId, userId, newPosition) => {
    const response = await api.put(`/queue/${courtId}/position`, { userId, newPosition });
    return response.data;
  },

  getQueueHistory: async (courtId) => {
    const response = await api.get(`/queue/${courtId}/history`);
    return response.data;
  }
};

export default queueService;