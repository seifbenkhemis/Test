const express = require("express");
const http = require("http");
const config = require("./config/dbconnection.json");
const mongo = require("mongoose");
const bodyparser = require("body-parser");
const path = require("path");
const{addpartiesocket,getbyidsocket}=require('./controller/partieController')
const partieController = require('./controller/partieController')
mongo
  .connect(config.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connected"))
  .catch(() => console.log("database not connected"));

const userRouter = require("./routes/users");
const partieRouter = require("./routes/partie");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use("/users", userRouter);
app.use("/partie", partieRouter);

const server = http.createServer(app);
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("msg", "A new user is connected");

  socket.on("partie", (data) => {
    addpartiesocket(data)
    io.emit("partie", data);
  });
  // socket.on("fini",data=>{
  //   window.alert(data);
  // })

  socket.on("aff",async (data) => {
    const dataupdate=await getbyidsocket(data)
    io.emit("aff", dataupdate);
  });

  socket.on("msg", (data) => {
    io.emit("msg", data);
  });
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
  socket.on("disconnect", () => {
    io.emit("msg", "An user is disconnected");
  });
  socket.on("attack",data=>{
    partieController.attack(io,data.j1,data.j2);
  });

});

server.listen(3000, console.log("server run"));

module.exports = app;