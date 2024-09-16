const express = require('express')
const path = require('path')
const http = require('http')
const  Filter = require('bad-words')
const socketio = require('socket.io');
const { log } = require('console');
const {generateMessage, generateLocationMessage} = require('./utils/messages')
 const {
    addUser,
    removeUser,
    getAllUserOfRoom,
    getUser
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000

const publicDirectoryFolder = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryFolder))

io.on('connection', (socket)=>{
    console.log('you have a new connection');

    socket.on('join', ({username, room}, callback)=>{

        const {error, user} = addUser({id:socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','hello there'))

        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} joined the room`))

        io.to(user.room).emit('roomData', {
            room : user.room,
            users: getAllUserOfRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback)=>{

        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    
    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMesaage', generateLocationMessage(user.username,`https://google.com/maps?=${location.lat},${location.lon}`))
        
        callback()
    })
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!!`))
            io.to(user.room).emit('roomData', {
                room : user.room,
                users: getAllUserOfRoom(user.room)
            })
        }  
    })

})




server.listen(PORT,()=>{
    console.log(`Server is up on port ${PORT}`)
})