const express = require('express')
const mongoose  = require('mongoose')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/message')
const {userJoin,getUser,userLeave,getUserRoom} = require('./utils/users')

const app = express()

const server = http.createServer(app)        //server for app
const io = socketio(server)                 // server for socket.io

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);    

mongoose.connect("mongodb://localhost/Zilch",(err,db)=>{
    if(err){
        console.log(err)
    }
    else{
        console.log("Db connected")
    }
});

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

        io.to(user.room).emit('sendUserData',{
            room : user.room,
            users : getUserRoom(user.room)
        })

        //when user disconnect
        socket.on('disconnect',data=>{
            const user = userLeave(socket.id)

            if(user){
                io.to(user.room).emit('message',formatMessage(botName,`${user.username} left the chat`))
                
                io.to(user.room).emit('sendUserData',{
                    room : user.room,
                    users : getUserRoom(user.room)
                })
            }

            
        })
    })


})




app.use(express.static('public'))

app.get('/',function(req,res) {
    res.sendFile('index.html');
  });

PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
    console.log(`Started server on ${PORT}`)
})