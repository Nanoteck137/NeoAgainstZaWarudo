# Room SocketIO Events

## Normal Events

### `rooms:get` 
* Retrive list of all the rooms
```javascript
socket.emit("rooms:get", (rooms) => {
    console.log(rooms);
});
```

### `rooms:join` 
* Join a room
```javascript
socket.emit("rooms:joinRoom", "room_id");
```

### `rooms:leave` 
* Leave the current room
```javascript
socket.emit("rooms:leave");
```

### `rooms:create` 
* Create new room
```javascript
socket.emit("rooms:create", "Room name", (room) => {
    console.log(room);
});
```

## Client Joined Room 

### `room:playerJoin` 
* Sent when a new player joins the room
```javascript
socket.on("rooms:playerJoin", (player) => {
    console.log(`${player.username} has joined the room`);
});
```

### `room:playerLeave` 
* Sent when a player leaves the room
```javascript
socket.on("rooms:playerLeave", (player) => {
    console.log(`${player.username} has left the room`);
});
```

### `room:changed` 
* The room changed settings (new owner, game settings)
```javascript
socket.on("rooms:changed", (room) => {
    console.log(room)
});
```

### `room:startGame` 
* The owner of the room starts the game 
```javascript
socket.emit("rooms:startGame");
```

### `room:startedGame` 
* The owner has started the game
```javascript
socket.on("rooms:startedGame", () => {
    console.log("The game has started")
});
```