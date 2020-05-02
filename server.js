const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()

const server = http.createServer(app)        //server for app
const io = socketio(server)                 // server for socket.io

io.on('connection',socket =>{
    console.log("New connection")
    socket.emit('message','yo man')
})

app.use(express.static('public'))


PORT = 3000 || process.env.PORT

server.listen(PORT,()=>{
    console.log(`Started server on ${PORT}`)
})