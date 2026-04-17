import api from './api';

const tournamentService = {
  getAllTournaments: async () => {
    const response = await api.get('/tournaments');
    return response.data;
  },

  getAvailableTournaments: async () => {
    const response = await api.get('/tournaments/available');
    return response.data;
  },

  getMyTournaments: async () => {
    const response = await api.get('/tournaments/my-tournaments');
    return response.data;
  },

  getTournamentById: async (id) => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  createTournament: async (tournamentData) => {
    const response = await api.post('/tournaments', tournamentData);
    return response.data;
  },

  updateTournament: async (id, tournamentData) => {
    const response = await api.put(`/tournaments/${id}`, tournamentData);
    return response.data;
  },

  deleteTournament: async (id) => {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  },

  registerForTournament: async (id) => {
    const response = await api.post(`/tournaments/${id}/register`);
    return response.data;
  },

  unregisterFromTournament: async (id) => {
    const response = await api.delete(`/tournaments/${id}/unregister`);
    return response.data;
  },

  getRegisteredPlayers: async (id) => {
    const response = await api.get(`/tournaments/${id}/players`);
    return response.data;
  },

  generateBracket: async (id) => {
    const response = await api.post(`/tournaments/${id}/generate-bracket`);
    return response.data;
  },

  updateTournamentStatus: async (id, status) => {
    const response = await api.put(`/tournaments/${id}/status`, { status });
    return response.data;
  }
};

export default tournamentService;