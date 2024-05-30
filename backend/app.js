const express = require("express")
const cors = require("cors")
const socketIO = require("socket.io")

const formatMessage = require("./utils/formatMSG")

const app = express();

app.use(cors());

const server = app.listen(8080,()=>{
    console.log("server started at port 8080");
});

const io = socketIO(server,{
    cors : "*"
})

// run when client-server connected
io.on("connection",(socket)=>{
    console.log("client connected");
    const BOT = "Chat bot";
// send welcome message to joined room
    socket.emit("message", formatMessage(BOT,"Welcome to the room"));
    
    // send joined message to all users expected of joined room
    socket.broadcast.emit(
        "message",
        formatMessage(BOT,"Other user joined the room")
    )

    socket.on("disconnect",()=>{
        io.emit("message",formatMessage(BOT,"Other user left the room"))
    })

})