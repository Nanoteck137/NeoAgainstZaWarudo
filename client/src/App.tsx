import { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Browse from "./pages/Browse";
import Game from "./pages/Game";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";
import Create from "./pages/Create";
import Room from "./pages/Room";
import "./style/index.scss";
import { SocketContext } from "./context/socketContext";
import { ServerPlayer, ServerRoom } from "./types/server";

/// TODO(patrik):
///  - Fix navigation stack

function App() {
  const socket = useContext(SocketContext);

  const [currentPlayer, setCurrentPlayer] = useState<ServerPlayer | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ServerRoom | null>(null);
  const [rooms, setRooms] = useState<ServerRoom[]>([]);
  const [roomPlayers, setRoomPlayers] = useState<ServerPlayer[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("client:joinedRoom", (room: ServerRoom, players: ServerPlayer[]) => {
      setCurrentRoom(room);
      setRoomPlayers([...players]);
      navigate("/room");
    });

    socket.on("client:leaveRoom", () => {
      setCurrentRoom(null);
      setRoomPlayers([]);
      navigate("/browse");
    });

    socket.on("room:playerJoin", (player: ServerPlayer) => {
      setRoomPlayers(prev => [...prev, player]);
    });
  }, [socket, navigate])

  useEffect(() => {
    // If the player if null then redirect to the login page
    if(currentPlayer === null) {
      navigate("/");
    }
  }, [currentPlayer, navigate]);

  const doLogin = (username: string) => {
    console.log("DoLogin", username);
    socket.emit("client:login", { username }, (player: ServerPlayer) => {
      setCurrentPlayer(player)
      doRefreshRoomList();
      navigate("/browse");
    });
    return true;
  }

  const doCreateRoom = (roomName: string) => {
    socket.emit("rooms:create", roomName, (room: ServerRoom) => {
      console.log("Created new room", room);
    });
  };

  const doRefreshRoomList = () => {
    socket.emit("rooms:get", (rooms: ServerRoom[]) => {
      console.log(rooms);
      setRooms(rooms);
    });
  }

  const doLeaveRoom = () => {
    socket.emit("rooms:leave");
  }

  return (
    <Routes>
      <Route path="/" element={<Home login={doLogin}/>} />
      <Route path="/browse" element={<Browse currentPlayer={currentPlayer} currentRoom={currentRoom} rooms={rooms} refreshRoomList={doRefreshRoomList}/>} />
      <Route path="/create" element={<Create createRoom={doCreateRoom}/>} />
      <Route path="/room" element={<Room currentRoom={currentRoom} leaveRoom={doLeaveRoom}/>} />
      <Route path="/game" element={<Game />} />
      <Route path="/test" element={<Test />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
