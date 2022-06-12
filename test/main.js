const socket = io("ws://localhost:1234");
socket.on("connect", () => {
    console.log("Connected to server");

    socket.emit("initialize", {
        username: "Test User",
    });

    socket.emit("rooms:get", (rooms) => {
        console.log("Rooms");
        console.log(rooms);
    });
});
console.log(socket);