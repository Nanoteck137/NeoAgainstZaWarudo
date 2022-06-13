import { Server } from "socket.io";
import { getBlackCardWithId, getRandomBlackCard, getRandomWhiteCard, getWhiteCardWithId } from "./card";
import { Player } from "./player";
import { getRoomById, rooms } from "./room";

// Game Mapping: RoomID -> Game
export const games = new Map<string, Game>();

export const defaultGameSettings: GameSettings = {
    scoreLimit: 10,
}

export interface GameSettings {
    scoreLimit: number,
}

export class Game {
    roomId: string; 

    judgeIndex: number;
    judge: string;
    blackCardId: number;

    hands: Map<string, number[]>;
    board: Map<string, number[]>;

    constructor(roomId: string) {
        this.roomId = roomId;

        this.judgeIndex = 0;
        this.judge = "";

        this.blackCardId = 0;

        this.hands = new Map();
        this.board = new Map();
    }

    checkIfAllPlayed(io: Server) {
        let maxPlayableCards = getBlackCardWithId(this.blackCardId)?.pick!;

        let room = getRoomById(this.roomId);
        if(room) {
            let allDone = true;
            for(let player of room.playerIds) {
                if(player === this.judge)
                    continue;

                let playerBoard = this.board.get(player);
                if(playerBoard) {
                    if(playerBoard.length < maxPlayableCards) {
                        allDone = false;
                        break;
                    }
                } else {
                    allDone = false;
                    break;
                }
            }

            if(allDone) {
                let cardPairs = [];
                let playerCards = [...this.board.values()];
                for(let playerCard of playerCards) {
                    let cards = [];
                    for(let card of playerCard) {
                        cards.push(getWhiteCardWithId(card));
                    }
                    cardPairs.push(cards);
                }

                io.to(room.id).emit("game:allDone", cardPairs);
            }
        }
    }

    playerPlay(io: Server, player: Player, handIndex: number) {
        // TODO(patrik): Change this?
        let maxPlayableCards = getBlackCardWithId(this.blackCardId)?.pick!;

        let hand = this.hands.get(player.id);
        if(hand && this.judge !== player.id) {
            let cardIndex = hand[handIndex];

            if(!this.board.has(player.id)) {
                this.board.set(player.id, [cardIndex]);
                // Remove the card from the player hand
                hand.splice(handIndex, 1);
            } else {
                let playerCards = this.board.get(player.id);
                if(playerCards!.length < maxPlayableCards) {
                    this.board.get(player.id)!.push(cardIndex);
                    // Remove the card from the player hand
                    hand.splice(handIndex, 1);
                }
            }

            let playerBoard = this.board.get(player.id);
            if(playerBoard!.length === maxPlayableCards) {
                io.to(player.id).emit("game:roundUpdate", { done: true });
            } else {
                let remaining = maxPlayableCards - playerBoard!.length;
                io.to(player.id).emit("game:roundUpdate", { cardToBePlayed: remaining });
            }

            io.to(player.id).emit("game:updateHand", this.getHandFromPlayerId(player.id));
        }

        this.checkIfAllPlayed(io);
    }

    pickNextJudge() {
        let room = getRoomById(this.roomId);
        if(room) {
            this.judge = [...room.playerIds][this.judgeIndex];
            this.judgeIndex = (this.judgeIndex + 1) % room.playerIds.size;
        }
    }

    pickNextBlackCard() {
        this.blackCardId = getRandomBlackCard().id;
    }

    getHandFromPlayerId(playerId: string) {
        let hand = this.hands.get(playerId);
        if(hand) {
            let result: any[] = [];
            for(let cardId of hand) {
                result.push(getWhiteCardWithId(cardId));
            }

            return result;
        }
    }

    startGame(io: Server) {
        let room = getRoomById(this.roomId);
        if(room) {
            for(let player of room.playerIds) {
                const num_cards = 10;

                let hand = [];
                for(let i = 0; i < num_cards; i++) {
                    let card = getRandomWhiteCard();
                    hand.push(card.id);  
                }
                this.hands.set(player, hand);
                
                io.to(player).emit("game:startGame", this.getHandFromPlayerId(player));
            }
        }

        this.nextRound(io);
    }

    givePlayerRoundCards(io: Server) {
        let room = getRoomById(this.roomId);
        if(room) {
            for(let player of room.playerIds) {
                if(player !== this.judge) {
                    // TODO(patrik): Add more cards here

                    io.to(player).emit("game:updateHand", this.getHandFromPlayerId(player));
                }
            }
        }
    }

    nextRound(io: Server) {
        this.pickNextJudge();
        this.pickNextBlackCard();
        this.givePlayerRoundCards(io);

        let judge = this.judge;
        let blackcard = getBlackCardWithId(this.blackCardId);
        io.to(this.roomId).emit("game:nextRound", judge, blackcard);
    }

    judgeSelect(io: Server, player: Player, pairIndex: number) {
        if(player.id === this.judge) {
            console.log(`Judge Selected: ${pairIndex}`)
        }
    }
}
