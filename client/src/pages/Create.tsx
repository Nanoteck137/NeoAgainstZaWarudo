import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../context/socketContext";
import useAppDispatch from "../hooks/useAppDispatch";
import { setRoom } from "../store/playerReducer";
import style from "../style/Create.module.scss";
import Room from "../types/Room";

interface Props {
  createRoom: (name: string) => void,
}

const Create = ({ createRoom }: Props) => {
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = () => {
    if (roomName.length > 0) {
      createRoom(roomName);
    } else {
      setError("Please enter a room name");
    }
  };

  return (
    <div className={style.container}>
      <div className={style.card}>
        <h1>Create a new room</h1>
        <div className={style.nameInput}>
          <label className="required">Room name</label>
          <input type="text" onChange={(e) => setRoomName(e.target.value)} />
          <p className={style.error}>{error}</p>
          <button onClick={create}>Create Room</button>
        </div>
      </div>
    </div>
  );
};

export default Create;
