import { ChangeEvent, useContext, useEffect, useState } from "react";
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
  const [sortedRooms, setSortedRooms] = useState<RoomType[]>([]);
  const { username } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const getRooms = () => {
    socket?.emit("rooms:get", (rooms: RoomType[]) => {
      setRooms(rooms);
      setSortedRooms(rooms);
    });
  };

  const changeSort = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "name") {
      console.log("sorting by name");

      setSortedRooms(rooms.sort((a, b) => a.name.localeCompare(b.name)));
    } else if (value === "players") {
      console.log("sorting by players");

      setSortedRooms(rooms.sort((a, b) => b.players - a.players));
      console.log(sortedRooms);
    } else {
      setSortedRooms(rooms);
    }
  };

  useEffect(() => {
    if (!username || username.length === 0) {
      navigate("/");
    }

    //getRooms();

    const roomList = [
      {
        id: "1",
        name: "Room 1",
        players: 0,
      },
      {
        id: "2",
        name: "Room 2",
        players: 0,
      },
      {
        id: "3",
        name: "Room 3",
        players: 10,
      },
      {
        id: "4",
        name: "Room 4",
        players: 0,
      },
      {
        id: "5",
        name: "Room 5",
        players: 0,
      },
      {
        id: "6",
        name: "Room 6",
        players: 20,
      },
      {
        id: "7",
        name: "Room 7",
        players: 0,
      },
      {
        id: "8",
        name: "Room 8",
        players: 30,
      },
      {
        id: "9",
        name: "Room 9",
        players: 0,
      },
      {
        id: "10",
        name: "Room 10",
        players: 0,
      },
      {
        id: "11",
        name: "Room 11",
        players: 0,
      },
      {
        id: "12",
        name: "Room 12",
        players: 0,
      },
    ];

    setRooms(roomList);

    setSortedRooms(roomList);
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
          <select className={style.sortList} onChange={changeSort}>
            <option value="null">Sort by</option>
            <option value="name">Name</option>
            <option value="players">Players</option>
          </select>
        </div>
      </div>
      <div className={style.rooms}>
        {sortedRooms.map((room) => (
          <Room key={`room-${room.id}`} room={room} />
        ))}
      </div>
    </div>
  );
};

export default Browse;
