import { ServerPlayer } from "./server";

interface GamePlayer {
  /*
  player: ServerPlayer,
  hand: any[], // WhiteCard[]
  */
}

export interface GameData {
  hand: any[];
  blackCard: any | null; // BlackCard
  currentJudgeId: string | null;
  remaningCardsToPlay: number;
}
