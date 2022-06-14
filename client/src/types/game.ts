import { ServerBlackCard, ServerWhiteCard } from "./server";

export interface GameData {
  hand: ServerWhiteCard[];
  blackCard: ServerBlackCard | null; // BlackCard
  currentJudgeId: string | null;
  remaningCardsToPlay: number;
}
