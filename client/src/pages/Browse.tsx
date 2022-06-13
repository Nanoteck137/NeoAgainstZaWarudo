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

  useEffect(() => {
    socket?.emit("rooms:get", (rooms: RoomType[]) => {
      setRooms(rooms);
    });

    setRooms([
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
      {
        id: "1",
        name: "Room 1",
      },
    ]);
  }, []);

  return (
    <div className={style.container}>
      <h1>Welcome {username}!</h1>
      <p>Join an existing room or create a new one.</p>
      <button className={style.createBtn}>Create a new room</button>
      <hr />
      <h3>Open rooms</h3>
      <div className={style.rooms}>
        {rooms.map((room) => (
          <Room room={room} />
        ))}
      </div>
    </div>
  );
};

export default Browse;
