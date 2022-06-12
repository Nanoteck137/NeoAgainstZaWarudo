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

io.on("connection", (socket: Socket) => {
    console.log("Connection");

    socket.on("disconnect", () => {
        console.log("Disconnect");
    })
});

server.listen(port, () => {
    console.log(`Running server on port ${port}`);
});
