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

class Room {
    id: string;
    name: string;
    playerIds: Set<string>;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.playerIds = new Set();
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
}

const players = new Map<string, Player>();
const rooms = new Map<string, Room>();

let roomId = 1;
rooms.set("0", new Room("0", "Test Room"));

function getRooms(): Room[] {
    return [...rooms.values()];
}

function joinRoom(socket: Socket, player: Player, roomId: string) {
    // Leave the current room
    if(player.currentRoom) {
        let room = rooms.get(player.currentRoom);
        if(room) {
            room.leave(player);
            socket.leave(room.id);
        }
    }

    // Join the new room
    let newRoom = rooms.get(roomId);
    if(newRoom) {
        newRoom.join(player);
        socket.join(newRoom.id);

        socket.emit("client:joinedRoom", newRoom, [...newRoom.playerIds]);
        io.to(newRoom.id).emit("room:playerJoin", player);
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
    }
}

io.on("connection", (socket: Socket) => {
    console.log(`Connection ${socket.id}`);

    socket.on("initialize", (data) => {
        players.set(socket.id, new Player(socket.id, data.username));

        socket.on("rooms:get", (callback) => {
            callback(getRooms());
        });

        socket.on("rooms:join", (id, callback) => {
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
            let id = `${roomId}`;
            rooms.set(id, new Room(id, name));
            console.log(`Creating new room '${id}: ${name}`);

            let player = players.get(socket.id);
            if(player) {
                joinRoom(socket, player, id);
            }

            roomId++;
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
