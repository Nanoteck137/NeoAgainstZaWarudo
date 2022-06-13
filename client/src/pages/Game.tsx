import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAppSelector from "../hooks/useAppSelector";
import useEnsurePlayer from "../hooks/useEnsurePlayer";
import useEnsurePlayerInRoom from "../hooks/useEnsurePlayerInRoom";

const Game = () => {
  const player = useAppSelector((state) => state.player);
  const { id } = useParams();
  const navigate = useNavigate();

  useEnsurePlayer();
  useEnsurePlayerInRoom();

  useEffect(() => {
    if (!player.currentRoom || player.currentRoom?.id !== id) {
      navigate("/browse");
    }
  }, []);

  return <>Game: {id}</>;
};

export default Game;
