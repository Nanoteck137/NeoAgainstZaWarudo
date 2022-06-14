import style from "../style/Room.module.scss";
import { ServerRoom } from "../types/server";

interface Props {
  currentRoom: ServerRoom | null;

  leaveRoom: () => void;
  startGame: () => void;
}

const Room = ({ currentRoom, leaveRoom, startGame }: Props) => {
  return (
    <div>
      <p>Room: {currentRoom ? currentRoom.name : ""}</p>
      <button className={style.leaveBtn} onClick={leaveRoom}>
        Leave Room
      </button>
      <button className={style.joinBtn} onClick={startGame}>
        Start Game
      </button>
    </div>
  );
};

export default Room;
