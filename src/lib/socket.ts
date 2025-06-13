// Socket.IO client connection
import { io, Socket } from "socket.io-client";
import type { SocketEvents } from "../types";

class SocketManager {
  private socket: Socket | null = null;
  private isConnecting = false;

  getSocket(): Socket {
    if (!this.socket && !this.isConnecting) {
      this.isConnecting = true;
      this.socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
        {
          autoConnect: false,
          transports: ["websocket", "polling"],
        }
      );
      this.isConnecting = false;
    }
    return this.socket!;
  }

  connect(): void {
    const socket = this.getSocket();
    if (!socket.connected) {
      socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  // Type-safe event emission
  emit<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]): void {
    this.getSocket().emit(event, data);
  }

  // Type-safe event listening
  on<K extends keyof SocketEvents>(
    event: K,
    handler: (data: SocketEvents[K]) => void
  ): void {
    this.getSocket().on(event as string, handler);
  }

  off<K extends keyof SocketEvents>(
    event: K,
    handler?: (data: SocketEvents[K]) => void
  ): void {
    this.getSocket().off(event as string, handler);
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
export const socket = socketManager.getSocket();
