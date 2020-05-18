const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/message");
const { userJoin, getUser, userLeave, getUserRoom } = require("./utils/users");

const app = express();

const server = http.createServer(app); //server for app
const io = socketio(server); // server for socket.io

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const botName = "Zilch Bot";

mongoose.connect("mongodb://localhost/Zilch", (err, db) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Db connected");

    io.on("connection", (socket) => {
      socket.on("join-chat", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        let chat = db.collection(room);

        chat
          .find()
          .limit(100)
          .sort({ _id: 1 })
          .toArray((err, res) => {
            if (err) {
              console.log(err);
            }
            socket.emit("output", res);
          });

        socket.emit(
          "message",
          formatMessage(botName, "Wellcome to Zilch!", " ")
        );

        //when user connects
        socket.broadcast
          .to(user.room)
          .emit(
            "message",
            formatMessage(botName, `${user.username} has joined the chat`, " ")
          );
        console.log(user.room);

        //sending chat message
        socket.on("chatMessage", (data) => {
          const user = getUser(socket.id);

          chat.insertOne(
            { username: user.username, text: data.msg, time: data.time },
            function () {
              io.to(user.room).emit(
                "message",
                formatMessage(user.username, data.msg, data.time)
              );
            }
          );
        });

        io.to(user.room).emit("sendUserData", {
          room: user.room,
          users: getUserRoom(user.room),
        });

        //when user disconnect
        socket.on("disconnect", (data) => {
          const user = userLeave(socket.id);

          if (user) {
            io.to(user.room).emit(
              "message",
              formatMessage(botName, `${user.username} left the chat`, " ")
            );

            io.to(user.room).emit("sendUserData", {
              room: user.room,
              users: getUserRoom(user.room),
            });
          }
        });

        socket.on("clear", () => {
          chat.remove({}, () => {
            console.log("removed");
          });
        });
      });
    });
  }
});

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/chats", function (req, res) {
  username = req.body.username;
  room = req.body.room;
  res.render("chat", { username: username, room: room });
});

PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Started server on ${PORT}`);
});
