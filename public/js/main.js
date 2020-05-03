const socket = io()
const chatForm = document.getElementById('chat-form')
const message_input = document.getElementById('msg')

socket.on('message',data=>{
    console.log(data)
    outputMessage(data)
})

chatForm.addEventListener('submit',e=>{
    e.preventDefault()
    const msg  = message_input.value
    socket.emit('chatMessage',msg)
    message_input.value = ''
})

function outputMessage (message) {
    const div = document.createElement('div')
    div.className = 'message'
    div.innerHTML = `<p class="meta">Brad <span>9:12pm</span></p>
    <p class="text">
        ${message}
    </p>`
    document.getElementById('chat_msg').appendChild(div)
}