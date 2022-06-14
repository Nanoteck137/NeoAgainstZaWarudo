import { ChangeEvent, useEffect, useState } from "react";
import RoomType from "../types/Room";
import style from "../style/Browse.module.scss";
import { useNavigate } from "react-router-dom";
import Room from "../components/Room";
import { FiRefreshCcw } from "react-icons/fi";
import Player from "../types/Player";

interface Props {
  currentPlayer: Player | null,
  rooms: RoomType[],

  refreshRoomList: () => void,
}

const Browse = ({ currentPlayer, rooms, refreshRoomList }: Props) => {
  const navigate = useNavigate();

  const doRefresh = () => {
    refreshRoomList(); 
  };

  const createRoom = () => {
    navigate("/create");
  }
  const [sortedRooms, setSortedRooms] = useState<RoomType[]>([]);

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
    // setSortedRooms(roomList);
  }, []);

  return (
    <div className={style.container}>
      <h1>Welcome {currentPlayer ? currentPlayer.username : ""}!</h1>
      <p>Join an existing room or create a new one.</p>
      <button className={style.createBtn} onClick={createRoom}>
        Create a new room
      </button>
      <hr />
      <div className={style.openRoomTitle}>
        <h3>Open rooms</h3>
        <div className={style.controls}>
          <button className={style.refreshBtn} onClick={doRefresh}>
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
        {rooms.map((room) => (
          <Room key={`room-${room.id}`} room={room} />
        ))}
      </div>
    </div>
  );
};

export default Browse;
