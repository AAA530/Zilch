const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()

const server = http.createServer(app)        //server for app
const io = socketio(server)                 // server for socket.io

io.on('connection',socket =>{
    socket.emit('message','yo man')

    //when user connects
    socket.broadcast.emit('message','A user connected')

    //when user disconnect
    socket.on('disconnect',data=>{
        io.emit('message',"A user just left chat")
    })

    socket.on('chatMessage',data=>{
        io.emit('message',data)
    })
})

app.use(express.static('public'))


PORT = 3000 || process.env.PORT

server.listen(PORT,()=>{
    console.log(`Started server on ${PORT}`)
})