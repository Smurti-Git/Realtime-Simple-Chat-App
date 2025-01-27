const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path'); // Add this line

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public'))); // Add this line

const users = {};

io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] });
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
