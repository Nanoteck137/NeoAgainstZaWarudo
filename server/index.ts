import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import http from "http"
import { Server, Socket } from "socket.io"
import cors from "cors"

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.SERVER_PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});

class Player {
    id: string;
    username: string;
    currentRoom: string | undefined;

    constructor(id: string, username: string) {
        this.id = id;
        this.username = username;
    }
}

interface GameSettings {
    scoreLimit: number,
}

const defaultGameSettings: GameSettings = {
    scoreLimit: 10,
}

class Room {
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
}

const cards = [
    { text: "Hello World" },
    { text: "Hello World 1" },
    { text: "Hello World 2" },
    { text: "Hello World 3" },
    { text: "Hello World 4" },
    { text: "Hello World 5" },
]

class Game {
    roomId: string; 

    judgeIndex: number;
    judge: string;
    blackCard: number;

    hands: Map<string, number[]>;

    constructor(roomId: string) {
        this.roomId = roomId;

        this.judgeIndex = 0;
        this.judge = "";

        this.blackCard = 0;

        this.hands = new Map();
    }

    playerPlay(player: Player, hand_index: number) {
        let hand = this.hands.get(player.id);
        // let card_index = hand[hand_index];
        console.log(`${player.username} plays `)
    }

    pickNextJudge() {
        let room = rooms.get(this.roomId);
        if(room) {
            this.judge = [...room.playerIds][this.judgeIndex];
            this.judgeIndex = (this.judgeIndex + 1) % room.playerIds.size;
        }
    }

    pickNextBlackCard() {
        this.blackCard = 0;
    }

    getHandFromPlayerId(playerId: string) {
        let hand = this.hands.get(playerId);
        if(hand) {
            let result: any[] = [];
            for(let card_index of hand) {
                result.push(cards[card_index]);
            }

            return result;
        }
    }

    startGame(io: Server) {
        let room = rooms.get(this.roomId);
        if(room) {
            for(let player of [...room.playerIds]) {
                const num_cards = 10;

                let hand = [];
                for(let i = 0; i < num_cards; i++) {
                    let card_index = Math.floor(Math.random() * cards.length);
                    hand.push(card_index);  
                }
                this.hands.set(player, hand);
                
                let c = this.getHandFromPlayerId(player);
                console.log(c);
                io.to(player).emit("game:startGame", c);
            }
        }

        this.nextRound(io);
    }

    givePlayerRoundCards(io: Server) {
        let room = rooms.get(this.roomId);
        if(room) {
            for(let player of [...room.playerIds]) {
                if(player !== this.judge) {
                    let newCards: any[] = [];
                    io.to(player).emit("game:nextRoundCards", newCards);
                }
            }
        }
    }

    nextRound(io: Server) {
        this.pickNextJudge();
        this.pickNextBlackCard();
        this.givePlayerRoundCards(io);

        let judge = this.judge;
        let blackcard = {
            name: "Testing Card"
        };
        io.to(this.roomId).emit("game:nextRound", judge, blackcard);
    }
}

const players = new Map<string, Player>();
const rooms = new Map<string, Room>();
const games = new Map<string, Game>();

let roomId = 0;

function getRooms(): Room[] {
    return [...rooms.values()];
}

function joinRoom(socket: Socket, player: Player, roomId: string) {
    let newRoom = rooms.get(roomId);
    if(newRoom) {
        // If the game has already started don't let the player in
        if(newRoom.gameStarted) {
            return;
        }
    }

    // Leave the current room
    if(player.currentRoom) {
        let room = rooms.get(player.currentRoom);
        if(room) {
            room.leave(player);
            socket.leave(room.id);
        }
    }

    // Join the new room
    if(newRoom) {
        newRoom.join(player);

        let p = Array.from(players.values()).filter(item => newRoom!.playerIds.has(item.id));
        socket.emit("client:joinedRoom", newRoom, p);

        io.to(newRoom.id).emit("room:playerJoin", player);
        socket.join(newRoom.id);
    }
}

function leaveRoom(socket: Socket, player: Player, room: Room) {
    room.leave(player);
    socket.leave(room.id);
    socket.emit("client:leaveRoom");

    if(room.playerIds.size <= 0) {
        rooms.delete(room.id);
    } else {
        io.to(room.id).emit("room:playerLeave", player);

        if(room.owner === player.id) {
            // Change the owner
            let newOwner = room.playerIds.values().next().value;
            // TODO(patrik): Check if the player exists?
            room.owner = newOwner;
            io.to(room.id).emit("room:changed", room);
        }
    }
}

io.on("connection", (socket: Socket) => {
    console.log(`Connection ${socket.id}`);

    socket.on("initialize", (data) => {
        players.set(socket.id, new Player(socket.id, data.username));

        socket.on("rooms:get", (callback) => {
            callback(getRooms());
        });

        socket.on("rooms:join", (id) => {
            let player = players.get(socket.id);
            let room = rooms.get(id);
            if(player && room) {
                console.log(`${player.username} joins '${room.id}'`)

                joinRoom(socket, player, room.id);
            }
        });

        socket.on("rooms:leave", () => {
            let player = players.get(socket.id);
            if(player && player.currentRoom) {
                let room = rooms.get(player.currentRoom);
                if(room) {
                    leaveRoom(socket, player, room);
                }
            }
        });

        socket.on("rooms:create", (name) => {
            let player = players.get(socket.id);
            if(player) {
                let id = `${roomId}`;
                rooms.set(id, new Room(id, name, player.id));
                console.log(`Creating new room '${id}: ${name}`);

                joinRoom(socket, player, id);

                roomId++;
            }
        });

        socket.on("rooms:startGame", () => {
            let player = players.get(socket.id);
            if(player && player.currentRoom) {
                let room = rooms.get(player.currentRoom);
                if(room) {
                    if(player.id === room.owner && !room.gameStarted) {
                        // Start the game
                        let game = room.startGame();
                        games.set(room.id, game);

                        io.to(room.id).emit("room:startedGame");

                        game.startGame(io);
                    }
                }
            }
        });

        socket.on("game:forceNextRound", () => {
            let player = players.get(socket.id);
            if(player && player.currentRoom) {
                let room = rooms.get(player.currentRoom);
                if(room) {
                    if(player.id === room.owner && room.gameStarted) {
                        let game = games.get(room.id);
                        if(game) {
                            game.nextRound(io);
                        }
                    }
                }
            }
        });

        socket.on("game:play", (hand_index: number) => {
            let player = players.get(socket.id);
            if(player && player.currentRoom) {
                let room = rooms.get(player.currentRoom);
                if(room) {
                    let game = games.get(room.id);
                    if(game) {
                        game.playerPlay(player, hand_index);
                    }
                }
            }
        });
    });

    socket.on("disconnect", () => {
        console.log(`Disconnect ${socket.id}`);
        let player = players.get(socket.id)
        if(player) {
            if(player.currentRoom) {
                let room = rooms.get(player.currentRoom);
                if(room) {
                    leaveRoom(socket, player, room);
                }
            }

            players.delete(socket.id);
        }
    })
});

server.listen(port, () => {
    console.log(`Running server on port ${port}`);
});
