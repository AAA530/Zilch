const socket = io()
const chatForm = document.getElementById('chat-form')
const message_input = document.getElementById('msg')
const ApperChat = document.getElementById('chat_msg')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')


// get username and room name
const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix : true
})

console.log(username + " " + room)

socket.emit('join-chat',{username,room})

socket.on('message',data=>{
    console.log(data)
    outputMessage(data)

    ApperChat.scrollTop = ApperChat.scrollHeight
})

socket.on('sendUserData',({room,users})=>{
    outputRoom(room)
    outputUsers(users)
})

chatForm.addEventListener('submit',e=>{
    e.preventDefault()
    const msg  = message_input.value
    socket.emit('chatMessage',msg)
    message_input.value = ''
    message_input.focus()
})

function outputMessage (message) {
    const div = document.createElement('div')
    div.className = 'message'
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    ApperChat.appendChild(div)
}

function outputRoom(room){
    roomName.innerHTML = room
}

function outputUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}