import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      // Listen for match updates
      newSocket.on('match-update', (data) => {
        toast.success(`Match ${data.matchId} updated!`);
      });

      // Listen for queue updates
      newSocket.on('queue-updated', (data) => {
        // Will be handled by component
      });

      // Listen for tournament updates
      newSocket.on('tournament-update', (data) => {
        toast.info(`Tournament ${data.tournamentName} has been updated`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};