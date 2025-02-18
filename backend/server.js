import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
const port = process.env.PORT || 3000;

const server = http.createServer(app);


const io = new Server(server);

io.on('connection', socket => {
    console.log('A user connected 👽')
    socket.emit('request', /* … */); // emit an event to the socket
    io.emit('broadcast', /* … */); // emit an event to all connected sockets
    socket.on('reply', () => { /* … */ }); // listen to the event
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})