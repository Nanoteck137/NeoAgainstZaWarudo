import { createContext } from "react";
import { io, Socket } from "socket.io-client";

export const socket = io(process.env.REACT_APP_SERVER_URL ?? "");

export const SocketContext = createContext(socket);
