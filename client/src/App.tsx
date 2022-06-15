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
import {
  ServerBlackCard,
  ServerPlayer,
  ServerRoom,
  ServerWhiteCard,
} from "./types/server";
import { GameData } from "./types/game";

/// TODO(patrik):
///  - Fix navigation stack

function App() {
  const socket = useContext(SocketContext);

  const [currentPlayer, setCurrentPlayer] = useState<ServerPlayer | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ServerRoom | null>(null);
  const [currentGameSettings, setCurrentGameSettings] = useState<any | null>(
    null
  );
  const [cardPacks, setCardPacks] = useState<any[]>([]);
  const [rooms, setRooms] = useState<ServerRoom[]>([]);
  const [roomPlayers, setRoomPlayers] = useState<ServerPlayer[]>([]);

  const [game, setGame] = useState<GameData | null>(null);

  const navigate = useNavigate();

  const socketIO = () => {
    socket.on(
      "client:joinedRoom",
      (room: ServerRoom, players: ServerPlayer[]) => {
        setCurrentRoom(room);
        setRoomPlayers([...players]);

        socket.emit(
          "room:getGameSettings",
          (settings: any, cardPacks: any[]) => {
            setCurrentGameSettings(settings);
            setCardPacks(cardPacks);
          }
        );

        navigate("/room");
      }
    );

    socket.on("client:leaveRoom", () => {
      setCurrentRoom(null);
      setRoomPlayers([]);
      navigate("/browse");
    });

    socket.on("room:playerJoin", (player: ServerPlayer) => {
      setRoomPlayers((prev) => [...prev, player]);
    });

    socket.on("room:playerLeave", (player: ServerPlayer) => {
      setRoomPlayers((prev) => prev.filter((p) => p.id !== player.id));
    });

    socket.on("room:startedGame", () => {});

    socket.on("game:startGame", (startingHand: ServerWhiteCard[]) => {
      setGame({
        blackCard: null,
        currentJudgeId: null,
        hand: [...startingHand],
        remaningCardsToPlay: 0,
      });
    });

    socket.on(
      "game:nextRound",
      (judgeId: string, blackCard: ServerBlackCard, scoreboard: any) => {
        setGame((prev) => {
          return {
            ...prev!,
            currentJudgeId: judgeId,
            blackCard,
            remaningCardsToPlay: blackCard.pick,
          };
        });
      }
    );

    socket.on("game:updateHand", (updatedHand: ServerWhiteCard[]) => {
      console.log("update hand", updatedHand);
      setGame((prev) => {
        return { ...prev!, hand: updatedHand };
      });
    });

    socket.on("game:roundUpdate", (update: any) => {
      // TODO(patrik): Change this to report 0 cards when done maybe?
      if (update.hasOwnProperty("done")) {
        setGame((prev) => {
          return {
            ...prev!,
            remaningCardsToPlay: 0,
          };
        });
      } else {
        setGame((prev) => {
          return {
            ...prev!,
            remaningCardsToPlay: update.cardToBePlayed,
          };
        });
      }
    });
    socket.on("game:allDone", () => {});
    socket.on("game:roundWinner", () => {});
  };

  useEffect(() => {
    socketIO();
  }, [socketIO]);

  useEffect(() => {
    // If the player if null then redirect to the login page
    if (currentPlayer === null) {
      navigate("/");
    }
  }, [currentPlayer, navigate]);

  const doLogin = (username: string) => {
    socket.emit("client:login", { username }, (player: ServerPlayer) => {
      console.log("Wot");
      setCurrentPlayer(player);
      doRefreshRoomList();
      navigate("/browse");
    });
    return true;
  };

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
  };

  const doLeaveRoom = () => {
    socket.emit("rooms:leave");
  };

  const doStartGame = () => {
    socket.emit("room:startGame");
    navigate("/game");
  };

  const doSetGameSettings = (settings: any) => {
    console.log("newsettings:", settings);
    setCurrentGameSettings(settings);
    // socket.emit("room:setGameSettings", settings);
  };

  useEffect(() => {
    console.log(game);
  }, [game]);

  return (
    <Routes>
      <Route path="/" element={<Home login={doLogin} />} />
      <Route
        path="/browse"
        element={
          <Browse
            currentPlayer={currentPlayer}
            currentRoom={currentRoom}
            rooms={rooms}
            refreshRoomList={doRefreshRoomList}
          />
        }
      />
      <Route path="/create" element={<Create createRoom={doCreateRoom} />} />
      <Route
        path="/room"
        element={
          <Room
            currentRoom={currentRoom}
            gameSettings={currentGameSettings}
            cardPacks={cardPacks}
            players={roomPlayers}
            player={currentPlayer}
            leaveRoom={doLeaveRoom}
            startGame={doStartGame}
            setGameSettings={doSetGameSettings}
          />
        }
      />
      <Route path="/game" element={<Game />} />
      <Route path="/test" element={<Test />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
