import style from "../style/Room.module.scss";
import RoomType from "../types/Room";
interface Props {
  room: RoomType;
}

const Room = ({ room }: Props) => {
  const joinRoom = () => {
    console.log("join room", room);
  };

  return (
    <div className={style.container}>
      <p className={style.name}>{room.name}</p>
      <p className={style.players}>Players: 123</p>
      <p className={style.password}>Password: Yes</p>
      {/* TODO: Replace placeholder */}
      <button className={style.joinBtn} onClick={joinRoom}>
        Join
      </button>
    </div>
  );
};

export default Room;
