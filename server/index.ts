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

interface Player {
    id: string,
    username: string,
}

interface Room {
    name: string,
    players: Player[],
}

const players = new Map<string, Player>();
const rooms = new Map<string, Room>();

rooms.set("0", { name: "Test Room", players: [] });

function getRooms(): Room[] {
    return [...rooms.values()];
}

io.on("connection", (socket: Socket) => {
    console.log(`Connection ${socket.id}`);

    socket.on("initialize", (data) => {
        players.set(socket.id, { id: socket.id, username: data.username });

        socket.emit("updateRooms", getRooms());
    });

    socket.on("disconnect", () => {
        console.log(`Disconnect ${socket.id}`);
        players.delete(socket.id);
    })
});

server.listen(port, () => {
    console.log(`Running server on port ${port}`);
});
