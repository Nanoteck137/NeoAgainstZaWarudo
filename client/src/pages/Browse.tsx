import { ChangeEvent, useEffect, useState } from "react";
import style from "../style/Browse.module.scss";
import SingleRoom from "../components/SingleRoom";
import { FiRefreshCcw } from "react-icons/fi";
import { ServerPlayer, ServerRoom } from "../types/server";

interface Props {
  currentPlayer: ServerPlayer | null;
  currentRoom: ServerRoom | null;
  rooms: ServerRoom[];

  refreshRoomList: () => void;
  gotoCreateGame: () => void;
}

const Browse = ({
  currentPlayer,
  currentRoom,
  rooms,
  refreshRoomList,
  gotoCreateGame,
}: Props) => {
  const [sortedRooms, setSortedRooms] = useState<ServerRoom[]>([]);
  const [sortMethod, setSortMethod] = useState<string>("null");

  useEffect(() => {
    changeSort(sortMethod);
  }, [rooms]);

  const doRefresh = () => {
    refreshRoomList();
  };

  const createRoom = () => {
    gotoCreateGame();
    // navigate("/create");
  };

  const changeSort = async (e: ChangeEvent<HTMLSelectElement> | string) => {
    let value = "";

    if (typeof e === "string") {
      value = e;
    } else {
      value = e.target.value;
    }

    setSortMethod(value);

    if (value === "name") {
      setSortedRooms([...rooms].sort((a, b) => a.name.localeCompare(b.name)));
    } else if (value === "players") {
      setSortedRooms([...rooms].sort((a, b) => b.playerCount - a.playerCount));
    } else {
      setSortedRooms([...rooms]);
    }
  };

  return (
    <div className={style.browseContainer}>
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

          return <SingleRoom key={`room-${room.id}`} room={room} />;
        })}
      </div>
    </div>
  );
};

export default Browse;
