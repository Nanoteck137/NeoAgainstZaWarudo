import { readFileSync } from "fs";
import { err } from "./util";

const blackCards: Map<number, BlackCard> = new Map();
const whiteCards: Map<number, WhiteCard> = new Map();
const cardPacks: Map<number, CardPack> = new Map();

interface BlackCard {
    id: number,
    draw: number,
    pick: number,
    text: string,
    watermark: string,
}

interface WhiteCard {
    id: number,
    text: string,
    watermark: string,
}

interface CardPack {
    id: number,
    name: string,
    blackCards: number[],
    whiteCards: number[],
}

interface BlackCardData {
    draw: number,
    pick: number,
    text: string,
    watermark: string,
}

interface WhiteCardData {
    text: string,
    watermark: string,
}

interface CardPackData {
    name: string,
    black_cards: BlackCardData[],
    white_cards: WhiteCardData[],
}

export function readCardList() {
    let path = process.env.SERVER_CARD_LIST_PATH || 
        err("'SERVER_CARD_LIST_PATH' needs to be set");

    try {
        let data = readFileSync(path!);
        let cardPackData: CardPackData[] = JSON.parse(data.toString());

        let nextCardPackId  = 0;
        let nextBlackCardId = 0;
        let nextWhiteCardId = 0;

        for(let cardPack of cardPackData) {
            let blackCardIds: number[] = [];
            for(let blackCard of cardPack.black_cards) {
                let id = nextBlackCardId++;

                blackCardIds.push(id);
                blackCards.set(id, {
                    id: id,
                    draw: blackCard.draw,
                    pick: blackCard.pick,
                    text: blackCard.text,
                    watermark: blackCard.watermark,
                });
            }

            let whiteCardIds: number[] = [];
            for(let whiteCard of cardPack.white_cards) {
                let id = nextWhiteCardId++;

                whiteCardIds.push(id);
                whiteCards.set(id, {
                    id,
                    text: whiteCard.text,
                    watermark: whiteCard.watermark,
                });
            }

            let cardPackId = nextCardPackId++;
            cardPacks.set(cardPackId, {
                id: cardPackId,
                name: cardPack.name,
                blackCards: blackCardIds,
                whiteCards: whiteCardIds,
            }) 
        }
    } catch(err) {
        throw err;
    }
}

export function getWhiteCardWithId(id: number) {
    return whiteCards.get(id);
}

export function getBlackCardWithId(id: number) {
    return blackCards.get(id);
}

export function getRandomWhiteCard() {
    let cards = [...whiteCards.values()];

    let index = Math.floor(Math.random() * cards.length);
    return cards[index];
}

export function getRandomBlackCard() {
    let cards = [...blackCards.values()];

    let index = Math.floor(Math.random() * cards.length);
    return cards[index];
}