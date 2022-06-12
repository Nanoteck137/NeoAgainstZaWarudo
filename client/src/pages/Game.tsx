import { useParams } from "react-router-dom";

const Game = () => {
  const { id } = useParams();

  return <>Game: {id}</>;
};

export default Game;
