import Room from "./Room";

interface Player {
  id: string;
  username: string;
  currentRoom?: Room | undefined;
}

export default Player;
