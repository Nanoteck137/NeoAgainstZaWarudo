import Player from "../types/Player";
import RoomType from "../types/Room";

interface Props {
  currentRoom: RoomType | null,
  players: Player[],
} 

const Game = ({ currentRoom, players }: Props) => {
  return <div>
    <p>Room: {currentRoom ? currentRoom.name : ""}</p>
    {players.map((item, i: number) => { return <p key={i}>{item.username}</p>})}
  </div>;
};

export default Game;
