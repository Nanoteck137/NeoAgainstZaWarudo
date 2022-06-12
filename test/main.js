const socket = io("ws://localhost:3005");

let roomPlayers = undefined;
let currentRoom = undefined;

let game = undefined;

document.querySelector("#usernameSelect").addEventListener("submit", (e) => {
  e.preventDefault();
  document.querySelector("#usernameSelect").style.display = "none";
  document.querySelector("#showWhenMainMenu").style.display = "block";
  document.querySelector("#showWhenInGame").style.display = "none";

  let username = document.querySelector("#username").value;
  console.log(`Using username: ${username}`);

  socket.emit("initialize", {
    username: `${username}`,
  });

  socket.emit("rooms:get", (rooms) => {
    addRoomsToList(rooms);
  });
});

document.querySelector("#newRoom").addEventListener("submit", (e) => {
  e.preventDefault();

  let roomName = document.querySelector("#roomName").value;
  socket.emit("rooms:create", roomName);
});

document.querySelector("#refreshRoomList").addEventListener("click", () => {
  socket.emit("rooms:get", (rooms) => {
    addRoomsToList(rooms);
  });
});

document.querySelector("#leaveRoom").addEventListener("click", () => {
  socket.emit("rooms:leave");
});

document.querySelector("#startGame").addEventListener("click", () => {
  socket.emit("rooms:startGame");
});

document.querySelector("#forceNextRound").addEventListener("click", () => {
  socket.emit("game:forceNextRound");
});

socket.on("client:joinedRoom", (room, players) => {
  document.querySelector("#showWhenMainMenu").style.display = "none";
  document.querySelector("#showWhenInRoom").style.display = "block";

  document.querySelector("#currentRoomName").innerHTML = `${room.name}`;

  console.log(`Joined room '${room.name}'`);
  console.log(`${players.length} player(s) is currently in this room`);
  console.log(players);

  roomPlayers = players;
  currentRoom = room;
  displayPlayers();
});

socket.on("client:leaveRoom", () => {
  document.querySelector("#showWhenMainMenu").style.display = "block";
  document.querySelector("#showWhenInRoom").style.display = "none";
  roomPlayers = undefined;
  currentRoom = undefined;

  socket.emit("rooms:get", (rooms) => {
    addRoomsToList(rooms);
  });
});

socket.on("room:playerJoin", (player) => {
  console.log(`${player.username} join game`);
  roomPlayers.push(player);
  displayPlayers();
});

socket.on("room:playerLeave", (player) => {
  console.log(`${player.username} leave game`);

  roomPlayers = roomPlayers.filter((item) => item.id !== player.id);
  displayPlayers();
});

socket.on("room:changed", (room) => {
  currentRoom = room;
  displayPlayers();
});

socket.on("room:startedGame", () => {
  console.log("The game has started");
  document.querySelector("#showWhenMainMenu").style.display = "none";
  document.querySelector("#showWhenInRoom").style.display = "none";
  document.querySelector("#showWhenInGame").style.display = "block";

  game = {};
});

socket.on("game:startGame", (hand) => {
  console.log("Starting Hand");
  console.log(hand);
  game.hand = hand;
});

socket.on("game:nextRound", (judge, blackcard) => {
  console.log("Next round");
  console.log(judge);
  console.log(blackcard);

  game.blackcard = blackcard;
  game.judge = judge;

  displayGame();
});

socket.on("game:updateHand", (hand) => {
  game.hand = hand;
  displayGame();
});

socket.on("game:roundUpdate", (update) => {
  console.log(update);
});

socket.on("game:allDone", () => {
  console.log("All done");
});

function addRoomsToList(rooms) {
  let list = document.querySelector("#roomList");
  list.innerHTML = "";

  for (let room of rooms) {
    let item = helperCreateRoomItem(room);
    list.appendChild(item);
  }
}

function displayPlayers() {
  let list = document.querySelector("#playerList");
  list.innerHTML = "";

  for (let player of roomPlayers) {
    let element = document.createElement("li");
    if (currentRoom.owner === player.id) {
      element.innerHTML = `${player.username} (owner)`;
    } else {
      element.innerHTML = player.username;
    }

    list.appendChild(element);
  }
}

function displayGame() {
  if (game.blackcard)
    document.querySelector("#blackcard p").innerHTML = game.blackcard.name;

  let hand = document.querySelector("#hand");
  hand.innerHTML = "";

  for (let i = 0; i < game.hand.length; i++) {
    let element = helperCreateCard(i, game.hand[i]);
    hand.appendChild(element);
  }
}

function helperCreateCard(index, card) {
  /*
    <div class="card">
        <p>some card text</p>
        <button>play card</button>
    </div>
*/

  let text = document.createElement("p");
  text.innerHTML = `${card.text}`;

  let button = document.createElement("button");
  button.innerHTML = "Play card";
  button.addEventListener("click", () => {
    socket.emit("game:play", index);
  });

  let container = document.createElement("div");
  container.classList.add("card");
  container.appendChild(text);
  container.appendChild(button);

  return container;
}

function helperCreateRoomItem(room) {
  /*
    <div class="roomItem">
        <p>Test Room</p>
        <button>Join Room</button>
    </div>
*/

  let nameTag = document.createElement("p");
  nameTag.innerHTML = room.name;

  let joinButton = document.createElement("button");
  joinButton.innerHTML = "Join Room";
  joinButton.addEventListener("click", () => {
    socket.emit("rooms:join", room.id);
  });

  let container = document.createElement("div");
  container.classList.add("roomItem");

  container.appendChild(nameTag);
  container.appendChild(joinButton);

  return container;
}
