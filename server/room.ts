import { defaultGameSettings, Game, GameSettings } from "./game";
import { getAllPlayers, Player } from "./player";

export const rooms = new Map<string, Room>();

export interface ClientRoom {
    id: string;
    name: string;
    owner: string,
    playerCount: number,
    gameStarted: boolean,
}

export class Room {
    id: string;
    name: string;
    owner: string;
    playerIds: Set<string>;
    gameStarted: boolean;
    gameSettings: GameSettings;

    constructor(id: string, name: string, owner: string) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.playerIds = new Set();
        this.gameStarted = false;
        this.gameSettings = defaultGameSettings;
    }

    join(player: Player) {
        // TODO(patrik): Do we need to check if the player already has 
        // joined this room?
        player.currentRoom = this.id;
        this.playerIds.add(player.id);
    }

    leave(player: Player) {
        // TODO(patrik): Do we need to check if the player already has 
        // joined this room?
        // TODO(patrik): We should check currentRoom === this.id
        player.currentRoom = undefined;
        this.playerIds.delete(player.id);
    }

    startGame() {
        this.gameStarted = true;
        return new Game(this.id);
    }

    getPlayerObjects() {
        return getAllPlayers()
            .filter(item => this.playerIds.has(item.id));
    }

    toClientObject(): ClientRoom {
        let playerCount = this.playerIds.size;
        return {
            id: this.id,
            name: this.name,
            owner: this.owner,
            playerCount: playerCount,
            gameStarted: this.gameStarted,
        };
    }
}

export function getRoomById(roomId: string) {
    return rooms.get(roomId);
}

export function deleteRoomById(roomId: string) {
    rooms.delete(roomId);
}

export function registerNewRoom(room: Room) {
    rooms.set(room.id, room);
}