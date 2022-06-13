import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  // useEffect(() => {
  //   if (!socket) {
  //     const socket = io(process.env.REACT_APP_SERVER_URL ?? "");
  //     setSocket(socket);
  //   }
  // }, []);

  return socket;
};

export default useSocket;
