import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Player Pages
import PlayerDashboard from './pages/player/PlayerDashboard';
import MyMatches from './pages/player/MyMatches';
import AvailableTournaments from './pages/player/AvailableTournaments';
import QuickPlay from './pages/player/QuickPlay';
import MyStats from './pages/player/MyStats';
import Profile from './pages/player/Profile';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import ManageTournaments from './pages/organizer/ManageTournaments';
import CreateTournament from './pages/organizer/CreateTournament';
import ManageMatches from './pages/organizer/ManageMatches';
import ManageCourts from './pages/organizer/ManageCourts';
import TournamentBracket from './pages/organizer/TournamentBracket';
import OrganizerProfile from './pages/organizer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import SystemSettings from './pages/admin/SystemSettings';
import Reports from './pages/admin/Reports';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Player Routes */}
      <Route path="/player" element={
        <ProtectedRoute allowedRoles={['player']}>
          <PlayerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/player/matches" element={
        <ProtectedRoute allowedRoles={['player']}>
          <MyMatches />
        </ProtectedRoute>
      } />
      <Route path="/player/tournaments" element={
        <ProtectedRoute allowedRoles={['player']}>
          <AvailableTournaments />
        </ProtectedRoute>
      } />
      <Route path="/player/quick-play" element={
        <ProtectedRoute allowedRoles={['player']}>
          <QuickPlay />
        </ProtectedRoute>
      } />
      <Route path="/player/stats" element={
        <ProtectedRoute allowedRoles={['player']}>
          <MyStats />
        </ProtectedRoute>
      } />
      <Route path="/player/profile" element={
        <ProtectedRoute allowedRoles={['player']}>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Organizer Routes */}
      <Route path="/organizer" element={
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
          <OrganizerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/organizer/tournaments" element={
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
          <ManageTournaments />
        </ProtectedRoute>
      } />
      <Route path="/organizer/tournaments/create" element={
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
          <CreateTournament />
        </ProtectedRoute>
      } />
      <Route path="/organizer/tournaments/:id/bracket" element={
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
          <TournamentBracket />
        </ProtectedRoute>
      } />
      <Route path="/organizer/matches" element={
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
          <ManageMatches />
        </ProtectedRoute>
      } />
      <Route path="/organizer/courts" element={
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
          <ManageCourts />
        </ProtectedRoute>
      } />
      <Route path="/organizer/profile" element={
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerProfile />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ManageUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <SystemSettings />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;