import { useEffect } from "react";
import { useNavigate } from "react-router";
import useAppSelector from "./useAppSelector";

const useEnsurePlayer = () => {
  const player = useAppSelector((state) => state.player);
  const navigator = useNavigate();

  useEffect(() => {
    if (player.id === "" || player.id.length === 0) {
      navigator("/");
    }
  }, []);
};

export default useEnsurePlayer;
