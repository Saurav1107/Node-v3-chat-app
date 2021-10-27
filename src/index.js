const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { messageGenerate, generateLocationMessage } = require('./utils/message')
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser
} = require('../src/utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', socket => {
  console.log('new Web Socket Connection')

  socket.on('join', ({ username, room },cb) => {
    const { error, user } = addUser({ id: socket.id, username, room })

    if(error){
      return cb(error)
    }


    socket.join(user.room)

    socket.emit('message', messageGenerate('Admin','Welcome!'))
    socket.broadcast.to(user.room).emit('message', messageGenerate('Admin',`${user.username} has joined!`))
    io.to(user.room).emit('roomData',{
      room: user.room,
      users : getUsersInRoom(user.room)
    })


    cb()
  })

  socket.on('sendMessage', (msg, cb) => {
    const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(msg)) {
      return cb('profanity is not allowed')
    }
    io.to(user.room).emit('message', messageGenerate(user.username,msg))
    cb()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if(user){
      io.to(user.room).emit('message', messageGenerate('Admin',`${user.username} has Left`));
      io.to(user.room).emit('roomData',{
        room: user.room,
        users : getUsersInRoom(user.room)
      })
    }
  })

  socket.on('location', (location, cb) => {
    const user = getUser(socket.id)
    io.emit(
      'locationMessage',
      generateLocationMessage(
        user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    )
    cb()
  })
})

server.listen(3000, () => {
  console.log('Server Running on Port 3000')
})
