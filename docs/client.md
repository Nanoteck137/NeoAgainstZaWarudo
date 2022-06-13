# Client SocketIO Events

## Normal

### `client:login` 
* Login the client with a username
```javascript
socket.emit("client:login", { username: "" }, (player) => {
    console.log(player);
});
```
* When the client successfully logins the player is provided inside the callback function

### `client:logout` 
* Logout the client
```javascript
socket.emit("client:logout");
```

### `client:joinedRoom` 
* Sent when the client successfully joined a room
```javascript
socket.on("client:joinedRoom", (room) => {
    console.log(`You joined '${room.name}'`);
});
```

### `client:leaveRoom` 
* Sent when the client leaves the room
```javascript
socket.on("client:leaveRoom", () => {
    console.log(`You left the room`);
});
```