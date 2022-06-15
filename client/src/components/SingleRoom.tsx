import { useContext, useEffect } from "react";
import { SocketContext } from "../context/socketContext";
import style from "../style/SingleRoom.module.scss";
import { ServerRoom } from "../types/server";

interface Props {
  room: ServerRoom;
}

const SingleRoom = ({ room }: Props) => {
  const socket = useContext(SocketContext);

  const joinRoom = () => {
    console.log(socket?.id);

    socket?.emit("rooms:join", room.id);
  };

  useEffect(() => {
    console.log("new socket.on");
  }, []);

  return (
    <div className={style.container}>
      <div>
        <p className={style.name}>{room.name}</p>
        <p className={style.players}>Players: {room.playerCount}</p>
        <p className={style.password}>Password: Yes</p>
        {/* TODO: Replace placeholder */}
      </div>
      <button className={style.joinBtn} onClick={joinRoom}>
        Join
      </button>
    </div>
  );
};

export default SingleRoom;
