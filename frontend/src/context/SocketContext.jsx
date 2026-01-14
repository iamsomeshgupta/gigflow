import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const serverUrl = process.env.CLIENT_URL

  useEffect(() => {
    if (user) {
      const newSocket = io(serverUrl, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('bidHired', (data) => {
        if (String(data.freelancerId) === String(user.id)) {
          setNotifications((prev) => [
            {
              id: Date.now(),
              type: 'hired',
              message: data.message,
              gigTitle: data.gigTitle
            },
            ...prev
          ]);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
