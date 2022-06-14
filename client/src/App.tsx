import { useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Browse from "./pages/Browse";
import Game from "./pages/Game";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";
import Create from "./pages/Create";
import "./style/index.scss";
import { SocketContext } from "./context/socketContext";
import Player from "./types/Player";
import RoomType from "./types/Room";

/// TODO(patrik):
///  - Fix navigation stack

function App() {
  const socket = useContext(SocketContext);

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomType | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("client:joinedRoom", (room: RoomType, players: Player[]) => {
      setCurrentRoom(room);
      setRoomPlayers([...players]);
      navigate("/game");
    });

    socket.on("room:playerJoin", (player: Player) => {
      console.log("PlayerJoin", player);
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
    socket.emit("client:login", { username }, (player: Player) => {
      setCurrentPlayer(player)
      doRefreshRoomList();
      navigate("/browse");
    });
    return true;
  }

  const doCreateRoom = (roomName: string) => {
    socket.emit("rooms:create", roomName, (room: RoomType) => {
      console.log("Created new room", room);
    });
  };

  const doRefreshRoomList = () => {
    socket.emit("rooms:get", (rooms: RoomType[]) => {
      console.log(rooms);
      setRooms(rooms);
    });
  }

  return (
    <Routes>
      <Route path="/" element={<Home login={doLogin}/>} />
      <Route path="/browse" element={<Browse currentPlayer={currentPlayer} currentRoom={currentRoom} rooms={rooms} refreshRoomList={doRefreshRoomList}/>} />
      <Route path="/create" element={<Create createRoom={doCreateRoom}/>} />
      <Route path="/game" element={<Game currentRoom={currentRoom} players={roomPlayers}/>} />
      <Route path="/test" element={<Test />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
