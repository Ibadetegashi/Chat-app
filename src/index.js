const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server)
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
    console.log("New client connected");


    socket.on('join', (options, callback) => {
        console.log(options);
        const { error, user } = addUser({ id: socket.id, ...options });
        if (error) {
            return callback(error);
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome ' + user.name))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.name} has joined!`))// send to everyone except sender
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })


    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.name, `https://www.google.com/maps?q=${latitude},${longitude}`));
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        const error = message.trim === '' ? 'Message cannot be empty' : null;
        if (error) {
            return callback(error);
        }
        io.to(user.room).emit('message', generateMessage(user.name, message));
        callback(null)
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.name} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})



const port = 3000 || process.env.PORT

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});
