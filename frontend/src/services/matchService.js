import api from './api';

const matchService = {
  getMyMatches: async () => {
    const response = await api.get('/matches/my-matches');
    return response.data;
  },

  getMatchById: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  getTournamentMatches: async (tournamentId) => {
    const response = await api.get(`/matches/tournament/${tournamentId}`);
    return response.data;
  },

  updateMatchScore: async (id, scores) => {
    const response = await api.put(`/matches/${id}/score`, { scores });
    return response.data;
  },

  completeMatch: async (id) => {
    const response = await api.put(`/matches/${id}/complete`);
    return response.data;
  },

  scheduleMatch: async (matchData) => {
    const response = await api.post('/matches/schedule', matchData);
    return response.data;
  },

  updateMatchStatus: async (id, status) => {
    const response = await api.put(`/matches/${id}/status`, { status });
    return response.data;
  }
};

export default matchService;