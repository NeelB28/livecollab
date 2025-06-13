import React, { createContext, useContext, useEffect, useState } from "react";
import { socketManager } from "../lib/socket";
import type { User, Comment } from "../types";

interface SocketContextType {
  isConnected: boolean;
  currentUser: User | null;
  connectedUsers: User[];
  joinRoom: (pdfId: string, user: User) => void;
  leaveRoom: (pdfId: string) => void;
  emitComment: (comment: Omit<Comment, "id" | "timestamp">) => void;
  setCurrentUser: (user: User) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);

  useEffect(() => {
    // Initialize connection
    socketManager.connect();

    // Set up event listeners
    const socket = socketManager.getSocket();

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectedUsers([]);
    };

    const handleUsersUpdate = (data: { users: User[] }) => {
      setConnectedUsers(data.users);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socketManager.on("users:update", handleUsersUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socketManager.off("users:update", handleUsersUpdate);
      socketManager.disconnect();
    };
  }, []);

  const joinRoom = (pdfId: string, user: User) => {
    if (isConnected) {
      socketManager.emit("user:join", { userId: user.id, pdfId });
      setCurrentUser(user);
    }
  };

  const leaveRoom = (pdfId: string) => {
    if (isConnected && currentUser) {
      socketManager.emit("user:leave", { userId: currentUser.id, pdfId });
    }
  };

  const emitComment = (comment: Omit<Comment, "id" | "timestamp">) => {
    if (isConnected) {
      const fullComment: Comment = {
        ...comment,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
      };
      socketManager.emit("comment:add", fullComment);
    }
  };

  const value: SocketContextType = {
    isConnected,
    currentUser,
    connectedUsers,
    joinRoom,
    leaveRoom,
    emitComment,
    setCurrentUser,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
 