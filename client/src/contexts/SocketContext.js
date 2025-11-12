import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Socket.io is not supported in Vercel serverless functions
    // This feature is disabled for serverless deployments
    // If you need real-time features, deploy the backend to a service that supports WebSockets
    // (e.g., Railway, Render, or a VPS)
    
    // Check if we're in a serverless environment or if Socket.io should be disabled
    const isServerless = process.env.REACT_APP_ENABLE_SOCKET !== 'true';
    
    if (isServerless) {
      // In serverless environment, socket features are disabled
      setConnected(false);
      setSocket(null);
      return;
    }

    // Only initialize Socket.io if explicitly enabled
    if (isAuthenticated && user && process.env.REACT_APP_SERVER_URL) {
      // Dynamically import socket.io-client only if needed
      import('socket.io-client').then(({ io }) => {
        const newSocket = io(process.env.REACT_APP_SERVER_URL, {
          auth: {
            token: localStorage.getItem('token'),
          },
        });

        newSocket.on('connect', () => {
          console.log('Connected to server');
          setConnected(true);
          
          // Join admin room if user is admin
          if (user.role === 'admin') {
            newSocket.emit('join-room', 'admin');
          }
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from server');
          setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          setConnected(false);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }).catch((error) => {
        console.warn('Socket.io is not available:', error);
        setConnected(false);
      });
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const emitInventoryUpdate = (productId, newStock) => {
    if (socket && connected) {
      socket.emit('inventory-update', {
        productId,
        newStock,
        timestamp: new Date(),
      });
    }
  };

  const value = {
    socket,
    connected,
    emitInventoryUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
