import { useState, useEffect, useRef } from 'react';

const useNotifications = (onNewNotification) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  const callbackRef = useRef(onNewNotification);
  useEffect(() => {
    callbackRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let isExplicitlyClosed = false;

    const connect = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) return;

      const wsUrl = `ws://localhost:8080/ws/notifications?token=${token}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          if (notification?.ID) {
            setUnreadCount(prev => prev + 1);
            if (callbackRef.current) callbackRef.current(notification);
          }
        } catch (err) { console.error('WS Parse Error:', err); }
      };

      ws.onclose = (e) => {
        if (!isExplicitlyClosed) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (err) => {
        ws.close();
      };
    };

    connect();

    return () => {
      isExplicitlyClosed = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close(1000);
      }
    };
  }, []);

  return { unreadCount, setUnreadCount };
};

export default useNotifications