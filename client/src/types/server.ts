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