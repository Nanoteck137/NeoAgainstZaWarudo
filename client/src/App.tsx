import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Card from "./components/Card";
import Browse from "./pages/Browse";
import Game from "./pages/Game";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";
import Create from "./pages/Create";
import "./style/index.scss";
import { SocketContext } from "./context/socketContext";
import Player from "./types/Player";
import Room from "./types/Room";
import RoomType from "./types/Room";

function App() {
  const socket = useContext(SocketContext);

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("client:joinedRoom", (room: Room, players: Player[]) => {
      setRoomPlayers([...players]);
      navigate("/game");
    });

    socket.on("room:playerJoin", (player: Player) => {
      console.log("PlayerJoin", player);
      setRoomPlayers(prev => [...prev, player]);
    });
  }, [])

  const doLogin = (username: string) => {
    console.log("DoLogin", username);
    socket.emit("client:login", { username }, (player: Player) => {
      setCurrentPlayer(player)
      socket.emit("rooms:get", (rooms: RoomType[]) => {
        setRooms(rooms);
      });
    });
    navigate("/browse");
    return true;
  }

  const doCreateRoom = (roomName: string) => {
    socket.emit("rooms:create", roomName, (room: RoomType) => {
      console.log("Created new room", room);
    });
  };

  return (
    <Routes>
      <Route path="/" element={<Home login={doLogin}/>} />
      <Route path="/browse" element={<Browse currentPlayer={currentPlayer} rooms={rooms}/>} />
      <Route path="/create" element={<Create createRoom={doCreateRoom}/>} />
      <Route path="/game" element={<Game players={roomPlayers}/>} />
      <Route path="/test" element={<Test />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
