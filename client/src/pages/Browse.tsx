import { ChangeEvent, useEffect, useState } from "react";
import style from "../style/Browse.module.scss";
import { useNavigate } from "react-router-dom";
import Room from "../components/Room";
import { FiRefreshCcw } from "react-icons/fi";
import { ServerPlayer, ServerRoom } from "../types/server";

interface Props {
  currentPlayer: ServerPlayer | null;
  currentRoom: ServerRoom | null;
  rooms: ServerRoom[];

  refreshRoomList: () => void;
}

const Browse = ({
  currentPlayer,
  currentRoom,
  rooms,
  refreshRoomList,
}: Props) => {
  const navigate = useNavigate();
  const [sortedRooms, setSortedRooms] = useState<ServerRoom[]>([]);

  useEffect(() => {
    if (currentRoom !== null) {
      navigate("/game");
    }
  }, [navigate]);

  useEffect(() => {
    setSortedRooms(rooms);
  }, [rooms]);

  const doRefresh = () => {
    refreshRoomList();
  };

  const createRoom = () => {
    navigate("/create");
  };

  const changeSort = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "name") {
      setSortedRooms([...rooms].sort((a, b) => a.name.localeCompare(b.name)));
    } else if (value === "players") {
      setSortedRooms([...rooms].sort((a, b) => b.playerCount - a.playerCount));
    } else {
      setSortedRooms([...rooms]);
    }
  };

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
        {sortedRooms.map((room) => {
          console.log("mapping room");

          return <Room key={`room-${room.id}`} room={room} />;
        })}
      </div>
    </div>
  );
};

export default Browse;
