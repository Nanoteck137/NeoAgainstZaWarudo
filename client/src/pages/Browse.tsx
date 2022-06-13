import { useEffect, useState } from "react";
import RoomType from "../types/Room";
import useSocket from "../hooks/useSocket";
import style from "../style/Browse.module.scss";
import useAppSelector from "../hooks/useAppSelector";
import { useNavigate } from "react-router-dom";
import Room from "../components/Room";

const Browse = () => {
  const socket = useSocket();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const { username } = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  if (!username || username.length === 0) {
    navigate("/");
  }

  const getRooms = () => {
    socket?.emit("rooms:get", (rooms: RoomType[]) => {
      setRooms(rooms);
    });
  };

  useEffect(() => {
    getRooms();

    setRooms([
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "2",
        name: "Room 2",
      },
      {
        id: "3",
        name: "Room 3",
      },
      {
        id: "4",
        name: "Room 4",
      },
      {
        id: "5",
        name: "Room 5",
      },
      {
        id: "6",
        name: "Room 6",
      },
      {
        id: "7",
        name: "Room 7",
      },
      {
        id: "8",
        name: "Room 8",
      },
      {
        id: "9",
        name: "Room 9",
      },
      {
        id: "10",
        name: "Room 10",
      },
      {
        id: "11",
        name: "Room 11",
      },
      {
        id: "12",
        name: "Room 12",
      },
    ]);
  }, []);

  return (
    <div className={style.container}>
      <h1>Welcome {username}!</h1>
      <p>Join an existing room or create a new one.</p>
      <button className={style.createBtn} onClick={() => navigate("/create")}>
        Create a new room
      </button>
      <hr />
      <h3>Open rooms</h3>
      <div className={style.rooms}>
        {rooms.map((room) => (
          <Room key={`room-${room.id}`} room={room} />
        ))}
      </div>
    </div>
  );
};

export default Browse;
