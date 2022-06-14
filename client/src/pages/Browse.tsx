import { useContext, useEffect, useState } from "react";
import RoomType from "../types/Room";
import style from "../style/Browse.module.scss";
import useAppSelector from "../hooks/useAppSelector";
import { useNavigate } from "react-router-dom";
import Room from "../components/Room";
import { SocketContext } from "../context/socketContext";
import useAppDispatch from "../hooks/useAppDispatch";
import { setRoom } from "../store/playerReducer";
import { FiRefreshCcw } from "react-icons/fi";

const Browse = () => {
  const socket = useContext(SocketContext);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const { username } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const getRooms = () => {
    socket?.emit("rooms:get", (rooms: RoomType[]) => {
      setRooms(rooms);
    });
  };

  useEffect(() => {
    if (!username || username.length === 0) {
      navigate("/");
    }

    getRooms();

    socket?.on("client:joinedRoom", (room: RoomType) => {
      dispatch(setRoom(room));
      navigate(`/game/${room.id}`);
    });

  }, []);

  return (
    <div className={style.container}>
      <h1>Welcome {username}!</h1>
      <p>Join an existing room or create a new one.</p>
      <button className={style.createBtn} onClick={() => navigate("/create")}>
        Create a new room
      </button>
      <hr />
      <div className={style.openRoomTitle}>
        <h3>Open rooms</h3>
        <div className={style.controls}>
          <button className={style.refreshBtn} onClick={getRooms}>
            <FiRefreshCcw size="16px" /> Refresh
          </button>
        </div>
      </div>
      <div className={style.rooms}>
        {rooms.map((room) => (
          <Room key={`room-${room.id}`} room={room} />
        ))}
      </div>
    </div>
  );
};

export default Browse;
