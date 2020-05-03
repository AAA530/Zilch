const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/message')
const {userJoin,getUser,userLeave,getUserRoom} = require('./utils/users')

const app = express()

const server = http.createServer(app)        //server for app
const io = socketio(server)                 // server for socket.io

const botName = 'Zilch Bot'

io.on('connection',socket =>{

    socket.on('join-chat',({username ,room})=>{

        const user = userJoin(socket.id , username , room)

        socket.join(user.room)

        socket.emit('message',formatMessage(botName,'Wellcome to Zilch!'))

        //when user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`))
        console.log(user.room)

        //sending chat message
        socket.on('chatMessage',data=>{
            const user = getUser(socket.id)

            io.to(user.room).emit('message',formatMessage(user.username,data))
        })

        //when user disconnect
        socket.on('disconnect',data=>{
            const user = userLeave(socket.id)

            if(user){
                io.to(user.room).emit('message',formatMessage(botName,`${user.username} left the chat`))
            }
        })

    })
})

app.use(express.static('public'))


PORT = 3000 || process.env.PORT

server.listen(PORT,()=>{
    console.log(`Started server on ${PORT}`)
})