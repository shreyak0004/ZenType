const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // CREATE ROOM
 socket.on("create-room", (data) => {
    const playerName = data.name;
const playerAvatar = data.avatar;

    const roomCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    rooms[roomCode] = {
      host: socket.id,
      players: [
        {
        id: socket.id,
        name: playerName,
        avatar: playerAvatar
        }
      ]
    };

    socket.join(roomCode);

    socket.emit("room-created", roomCode);

    console.log("Room created:", roomCode);

  });

  // JOIN ROOM
  socket.on("join-room", (data) => {

  const roomCode = data.roomCode;
  const playerName = data.name;
  const playerAvatar = data.avatar;

  if (rooms[roomCode]) {

    const alreadyJoined =
      rooms[roomCode].players.find(
        p => p.id === socket.id
      );

    if (!alreadyJoined) {

      rooms[roomCode].players.push({
        id: socket.id,
        name: playerName,
        avatar: playerAvatar
      });

    }

    socket.join(roomCode);

    io.to(roomCode).emit("player-joined", {
      room: roomCode,
      players: rooms[roomCode].players
    });

    console.log("Player joined:", roomCode);

  } else {

    socket.emit("room-not-found");

  }

});
  socket.on("start-race", (roomCode) => {

  io.to(roomCode).emit("race-started");

  console.log("Race started:", roomCode);

});

  // LIVE TYPING PROGRESS
  socket.on("typing-progress", (data) => {

    socket.to(data.room).emit("update-progress", {
      playerId: socket.id,
      progress: data.progress,
      wpm: data.wpm
    });

  });

  // DISCONNECT
  socket.on("disconnect", () => {

    console.log("User disconnected");

  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});