import express, { Request, Response } from "express"
import dotenv from "dotenv"
import http from "http"
import { Server, Socket } from "socket.io"
import cors from "cors"
import { getPlayerBySocket, Player, players, registerNewPlayer } from "./player"
import { deleteRoomById, getRoomById, registerNewRoom, Room, rooms } from "./room"
import { games } from "./game"

dotenv.config({ path: "../.env" });

/// TODO(patrik):
///   - When a player left/disconnects we need to cleanup the game if 
///     one has started
///   - Add player count to the room structure
///   - Refactor the sending of server infomation to the client
///   - room:create check name isEmpty


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

let roomId = 0;

function joinRoom(socket: Socket, player: Player, roomId: string) {
    let newRoom = getRoomById(roomId);
    if(newRoom) {
        // If the game has already started don't let the player in
        if(newRoom.gameStarted) {
            return;
        }
    }

    // Leave the current room
    if(player.currentRoom) {
        let room = getRoomById(player.currentRoom);
        if(room) {
            room.leave(player);
            socket.leave(room.id);
        }
    }

    // Join the new room
    if(newRoom) {
        newRoom.join(player);

        let playerObjects = newRoom!.getPlayerObjects()
            .map(p => p.toClientObject());
        socket.emit("client:joinedRoom", 
            newRoom.toClientObject(), playerObjects);

        io.to(newRoom.id).emit("room:playerJoin", player.toClientObject());
        socket.join(newRoom.id);
    }
}

function leaveRoom(socket: Socket, player: Player, room: Room) {
    room.leave(player);
    socket.leave(room.id);
    socket.emit("client:leaveRoom");

    if(room.playerIds.size <= 0) {
        deleteRoomById(room.id);
    } else {
        io.to(room.id).emit("room:playerLeave", player.toClientObject());

        if(room.owner === player.id) {
            // Change the owner
            // TODO(patrik): Move this to room.pickNewOwner()
            let newOwner = room.playerIds.values().next().value;
            // TODO(patrik): Check if the player exists?
            room.owner = newOwner;
            io.to(room.id).emit("room:changed", room.toClientObject());
        }
    }
}

function playerLogout(socket: Socket) {
    let player = getPlayerBySocket(socket);
    if(player) {
        if(player.currentRoom) {
            let room = getRoomById(player.currentRoom);
            if(room) {
                leaveRoom(socket, player, room);
            }
        }

        players.delete(socket.id);
    }
}

io.on("connection", (socket: Socket) => {
    console.log(`Connection ${socket.id}`);

    socket.on("client:login", (data, callback) => {
        registerNewPlayer(new Player(socket.id, data.username));
        callback(getPlayerBySocket(socket)!.toClientObject());

        socket.on("client:logout", () => {
            playerLogout(socket);
        });

        socket.on("rooms:get", (callback) => {
            let data = [...rooms.values()].map(room => room.toClientObject());
            callback(data);
        });

        socket.on("rooms:join", (id) => {
            let player = getPlayerBySocket(socket);
            let room = getRoomById(id);
            if(player && room) {
                console.log(`${player.username} joins '${room.id}'`)

                joinRoom(socket, player, room.id);
            }
        });

        socket.on("rooms:leave", () => {
            let player = getPlayerBySocket(socket);
            if(player && player.currentRoom) {
                let room = getRoomById(player.currentRoom);
                if(room) {
                    leaveRoom(socket, player, room);
                }
            }
        });

        socket.on("rooms:create", (name, callback) => {
            let player = getPlayerBySocket(socket);
            if(player && !player.currentRoom) {
                let id = `${roomId}`;
                let newRoom = new Room(id, name, player.id);
                registerNewRoom(newRoom);
                console.log(`Creating new room '${id}: ${name}`);

                joinRoom(socket, player, id);

                callback(getRoomById(id)!.toClientObject());

                roomId++;
            }
        });

        socket.on("room:startGame", () => {
            let player = getPlayerBySocket(socket);
            if(player && player.currentRoom) {
                let room = getRoomById(player.currentRoom);
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
            let player = getPlayerBySocket(socket);
            if(player && player.currentRoom) {
                let room = getRoomById(player.currentRoom);
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
            let player = getPlayerBySocket(socket);
            if(player && player.currentRoom) {
                let room = getRoomById(player.currentRoom);
                if(room) {
                    let game = games.get(room.id);
                    if(game) {
                        game.playerPlay(io, player, hand_index);
                    }
                }
            }
        });
    });

    socket.on("disconnect", () => {
        console.log(`Disconnect ${socket.id}`);

        playerLogout(socket);
    })
});

server.listen(port, () => {
    console.log(`Running server on port ${port}`);
});
