export const players = new Map<string, Player>();

export interface ClientPlayer {
    id: string;
    username: string,
    currentRoom: string | undefined;
}

export class Player {
    id: string;
    username: string;
    currentRoom: string | undefined;

    constructor(id: string, username: string) {
        this.id = id;
        this.username = username;
    }

    toClientObject(): ClientPlayer {
        return {
            id: this.id,
            username: this.username,
            currentRoom: this.currentRoom,
        };
    }
}

export function getAllPlayers() {
    return [...players.values()]
}