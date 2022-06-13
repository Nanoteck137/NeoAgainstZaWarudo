import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socketContext";
import useAppDispatch from "../hooks/useAppDispatch";
import { setRoom } from "../store/playerReducer";
import style from "../style/Room.module.scss";
import RoomType from "../types/Room";
interface Props {
  room: RoomType;
}

const Room = ({ room }: Props) => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const joinRoom = () => {
    console.log(socket?.id);

    socket?.emit("rooms:join", room.id);
  };

  useEffect(() => {
    console.log("new socket.on");

    socket?.on("client:joinedRoom", (room: RoomType) => {
      dispatch(setRoom(room));
      navigate(`/game/${room.id}`);
    });
  }, []);

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
