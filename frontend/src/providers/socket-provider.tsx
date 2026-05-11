"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // HttpOnly cookie, withCredentials: true ile tarayıcı tarafından
    // WebSocket handshake header'ına otomatik eklenir.
    // Backend (socket.ts) bu cookie'yi socket.request.headers.cookie'den parse eder.
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3000", {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("notification:new", (notification) => {
      // Invalidate notifications query to update the unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });

      // Show toast
      toast.info(notification.title, {
        description: notification.message,
      });
    });

    socketInstance.on("content:status-changed", (payload) => {
      // Invalidate all content-related queries for real-time dashboard updates
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({ queryKey: ["content-detail", payload.contentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["company-workflow-snapshot"] });

      // Show toast so the user knows a teammate changed something
      if (payload.title) {
        toast.info(payload.title, {
          description: `${payload.oldStatus} → ${payload.newStatus}`,
        });
      }
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.off("notification:new");
      socketInstance.off("content:status-changed");
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [user, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
