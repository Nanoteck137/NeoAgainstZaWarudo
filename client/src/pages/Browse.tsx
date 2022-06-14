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
import Player from "../types/Player";

interface Props {
  currentPlayer: Player | null,
  rooms: RoomType[],
}

const Browse = ({ currentPlayer, rooms }: Props) => {
  const navigate = useNavigate();

  // TODO(patrik): Check currentPlayer and navigate if null
  if(currentPlayer === null) {
    // TODO(patrik): Notify the parent component
  }

  const doRefresh = () => {

  };

  const createRoom = () => {
    navigate("/create");
  }

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
