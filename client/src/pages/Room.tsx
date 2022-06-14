import RoomType from "../types/Room"
import style from "../style/Room.module.scss"

interface Props {
    currentRoom: RoomType | null;

    leaveRoom: () => void,
}

const Room = ({ currentRoom, leaveRoom }: Props) => {
  return (
    <div>
        <p>Room: {currentRoom ? currentRoom.name : ""}</p>
        <button className={style.leaveBtn} onClick={leaveRoom}>Leave Room</button>
    </div>
  );
};

export default Room;