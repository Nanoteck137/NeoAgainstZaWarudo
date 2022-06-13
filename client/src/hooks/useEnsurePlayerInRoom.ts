import { useEffect } from "react";
import { useNavigate } from "react-router";
import useAppSelector from "./useAppSelector";

const useEnsurePlayerInRoom = () => {
  const player = useAppSelector((state) => state.player);
  const navigator = useNavigate();

  useEffect(() => {
    console.log("useEnsurePlayerInRoom", { player });

    if (!player.currentRoom || player.currentRoom.id.length === 0) {
      navigator("/browse");
    }
  }, []);
};

export default useEnsurePlayerInRoom;
