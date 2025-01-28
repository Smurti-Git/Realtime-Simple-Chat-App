const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Add this route to handle requests to the root ("/")
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// WebSocket setup
const users = {};
io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message, name: users[socket.id] });
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
