import { Server } from "socket.io";
import { getBlackCardWithId, getRandomBlackCard, getRandomWhiteCard, getWhiteCardWithId } from "./card";
import { getPlayerById, Player } from "./player";
import { getRoomById, rooms } from "./room";

// Game Mapping: RoomID -> Game
export const games = new Map<string, Game>();

const numStartingCards = 9;

export const defaultGameSettings: GameSettings = {
    scoreLimit: 10,
}

export interface GameSettings {
    scoreLimit: number,
}

interface CardPair {
    playerId: string,
    cards: number[],
}

interface ClientScore {
    playerId: string,
    score: number,
}

export class Game {
    roomId: string; 

    judgeIndex: number;
    judge: string;
    blackCardId: number;

    hands: Map<string, number[]>;
    board: Map<string, number[]>;
    score: Map<string, number>;

    cardPairs: CardPair[];

    constructor(roomId: string) {
        this.roomId = roomId;

        this.judgeIndex = 0;
        this.judge = "";

        this.blackCardId = 0;

        this.hands = new Map();
        this.board = new Map();
        this.score = new Map();

        this.cardPairs = [];
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
                let clientPairs = [];
                let serverPairs: CardPair[] = [];

                for(let playerCard of this.board) {
                    let cards = [];
                    for(let card of playerCard[1]) {
                        cards.push(getWhiteCardWithId(card)!);
                    }

                    clientPairs.push(cards);
                    serverPairs.push({
                        playerId: playerCard[0],
                        cards: cards.map(c => c.id),
                    });
                }

                this.cardPairs = serverPairs;
                io.to(room.id).emit("game:allDone", clientPairs);
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
                // Initialize the player scores
                this.score.set(player, 0);

                let hand = [];
                for(let i = 0; i < numStartingCards; i++) {
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
                    let amount = 1;

                    let blackCard = getBlackCardWithId(this.blackCardId);
                    if(blackCard) {
                        // TODO(patrik): Is this right?
                        amount += blackCard.draw;
                    }

                    let playerHand = this.hands.get(player);
                    if(playerHand) {
                        for(let i = 0; i < amount; i++) {
                            let card = getRandomWhiteCard();
                            playerHand.push(card.id);
                        }
                    }

                    io.to(player).emit("game:updateHand", this.getHandFromPlayerId(player));
                }
            }
        }
    }

    nextRound(io: Server) {
        this.board.clear();
        this.cardPairs = [];

        this.pickNextJudge();
        this.pickNextBlackCard();
        this.givePlayerRoundCards(io);

        let judge = this.judge;
        let blackcard = getBlackCardWithId(this.blackCardId);

        let scoreboard: ClientScore[] = [];
        for(let s of this.score) {
            let playerId = s[0];
            let score = s[1];

            scoreboard.push({
                playerId,
                score
            })
        }

        io.to(this.roomId).emit("game:nextRound", judge, blackcard, scoreboard);
    }

    addScoreToPlayer(player: Player, amount: number) {
        let score = this.score.get(player.id);
        let newScore = score! + amount;
        this.score.set(player.id, newScore);
    }

    judgeSelect(io: Server, player: Player, pairIndex: number) {
        if(player.id === this.judge) {
            // TODO(patrik): Check index
            let pair = this.cardPairs[pairIndex];
            let winningPlayer = getPlayerById(pair.playerId)!;
            this.addScoreToPlayer(winningPlayer, 1);

            io.to(this.roomId).emit("game:roundWinner", winningPlayer.toClientObject());

            this.nextRound(io);
        }
    }
}
