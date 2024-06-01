const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const formatMessage = require("./utils/formatMSG");
const {
  saveUser,
  getDisconnectUser,
  getSameRoomUsers,
} = require("./utils/users");

const Message = require("./models/Message");
const messageController = require("./controller/message");

const app = express();

app.use(cors());

app.get("/chat/:room", messageController.getOldMessage);

const server = app.listen(8080, () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Mongodb and server connected");
    })
    .catch((e) => {
      console.log("database connection error", e);
    });
});

const io = socketIO(server, {
  cors: "*",
});

// run when client-server connected
io.on("connection", (socket) => {
  //console.log("client connected");
  const BOT = "Chat bot";

  socket.on("joined_room", ({ username, room }) => {
    const user = saveUser(socket.id, username, room);
    socket.join(user.room);

    // send welcome message to joined room
    socket.emit("message", formatMessage(BOT, "Welcome to the room"));

    // send joined message to all users expected of joined room
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(BOT, username + " joined the room"));

    // listen message from client
    socket.on("message_send", (data) => {
      // send back message to client
      io.to(user.room).emit("message", formatMessage(user.username, data));

      // save message to database
      Message.create({
        username: user.username,
        message: data,
        room: user.room,
      });
    });

    // send room users
    io.to(user.room).emit("room_users", getSameRoomUsers(user.room));
  });

  socket.on("disconnect", () => {
    const user = getDisconnectUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(BOT, user.username + " left the room")
      );
      // update room users
      io.to(user.room).emit("room_users", getSameRoomUsers(user.room));
    }
  });
});
