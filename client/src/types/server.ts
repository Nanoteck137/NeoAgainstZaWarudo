export interface ServerRoom {
  id: string;
  name: string;
  owner: string;
  playerCount: number;
  gameStarted: boolean;
}

export interface ServerPlayer {
  id: string;
  username: string;
  currentRoom: string | undefined;
}

export interface ServerBlackCard {
  id: number;
  draw: number;
  pick: number;
  text: string;
  watermark: string;
}

export interface ServerWhiteCard {
  id: number;
  text: string;
  watermark: string;
}

export interface ServerCardPack {
  id: number;
  name: string;
  blackCards: number[];
  whiteCards: number[];
}

export interface ServerGameSettings {
  scoreLimit: number;
  packs: number[];
}
