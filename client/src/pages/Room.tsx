import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Player from "../components/Player";
import style from "../style/Room.module.scss";
import { ServerPlayer, ServerRoom } from "../types/server";

interface Props {
  currentRoom: ServerRoom | null;
  players: ServerPlayer[];
  player: ServerPlayer | null;
  gameSettings: any;

  startGame: () => void;
  leaveRoom: () => void;
  setGameSettings: (settings: any) => void;
}

//Lobby

const Room = ({
  currentRoom,
  players,
  player,
  gameSettings,
  startGame,
  leaveRoom,
  setGameSettings,
}: Props) => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [scoreLimit, setScoreLimit] = useState<number>(0);

  useEffect(() => {
    if (currentRoom === null) {
      navigate("/browse");
    }
  });

  useEffect(() => {
    // When we get access to gameSettings set the score limit to the
    // current score limit
    if (gameSettings !== null) setScoreLimit(gameSettings.scoreLimit);
  }, [gameSettings]);

  const openSettings = () => {
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setScoreLimit(gameSettings ? gameSettings.scoreLimit : 0);
  };

  const saveSettings = () => {
    if (gameSettings) {
      gameSettings.scoreLimit = scoreLimit;
      setGameSettings(gameSettings);

      closeSettings();
    }
  };

  console.log({ player, currentRoom });

  return (
    <div className={style.container}>
      <div className={style.top}>
        <h1>{currentRoom?.name}</h1>
        <p>
          Waiting for host to start the game
          {"...".split("").map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </p>
        <div className={style.controls}>
          <button className={style.leaveBtn} onClick={leaveRoom}>
            Leave room
          </button>
          {currentRoom?.owner === player?.id && (
            <>
              <button className={style.settingsBtn} onClick={openSettings}>
                Change settings
              </button>
              <button className={style.startBtn} onClick={startGame}>
                Start game
              </button>
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
        <div
          className={`${style.right} ${settingsOpen ? style.settingsOpen : ""}`}
        >
          <div className={style.chat}>Chat</div>
          <div className={style.settings}>
            Settings
            <br />
            <label>Score Limit</label>
            <input
              type="number"
              value={scoreLimit}
              onChange={(e) => {
                setScoreLimit(parseInt(e.target.value));
              }}
            />
            <br />
            <button onClick={closeSettings}>Close</button>
            <button onClick={saveSettings}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
