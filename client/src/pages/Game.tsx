import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../context/socketContext";
import useAppSelector from "../hooks/useAppSelector";
import useEnsurePlayer from "../hooks/useEnsurePlayer";
import useEnsurePlayerInRoom from "../hooks/useEnsurePlayerInRoom";
import Player from "../types/Player";
import Room from "../types/Room";

interface RoomData {
  players: Player[],
}

interface Props {
  players: Player[],
} 

const Game = ({ players }: Props) => {
  return <div>
    {players.map((item, i: number) => { return <p key={i}>{item.username}</p>})}
  </div>;
};

export default Game;
