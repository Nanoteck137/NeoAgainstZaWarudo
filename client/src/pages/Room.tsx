import { useEffect } from "react";
import { useNavigate } from "react-router";
import Player from "../components/Player";
import style from "../style/Room.module.scss";
import { ServerPlayer, ServerRoom } from "../types/server";

interface Props {
  currentRoom: ServerRoom | null;
  players: ServerPlayer[];
  player: ServerPlayer | null;
  startGame: () => void;

  leaveRoom: () => void;
}

//Lobby

const Room = ({ currentRoom, players, player, leaveRoom }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (currentRoom === null) {
      navigate("/browse");
    }
  });

  console.log({ player, currentRoom });

  return (
    <div className={style.container}>
      <div className={style.top}>
        <h1>{currentRoom?.name}</h1>
        <p>
          Waiting for host to start the game
          {"...".split("").map((char) => (
            <span>{char}</span>
          ))}
        </p>
        <div className={style.controls}>
          <button className={style.leaveBtn} onClick={leaveRoom}>
            Leave room
          </button>
          {currentRoom?.owner === player?.id && (
            <>
              <button className={style.settingsBtn}>Change settings</button>
              <button className={style.startBtn}>Start game</button>
            </>
          )}
        </div>
      </div>
      <div className={style.bottom}>
        <div className={style.playerList}>
          {players.map((singlePlayer) => (
            <Player
              key={singlePlayer.id}
              player={singlePlayer}
              me={player}
              host={currentRoom?.owner}
            />
          ))}
        </div>
        <div className={style.chat}>Test</div>
      </div>
    </div>
  );
};

export default Room;
