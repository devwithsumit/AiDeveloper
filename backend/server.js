import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken'
import { projectModel } from './models/project.model.js';
import mongoose from 'mongoose';
import { generateResult } from './services/ai.service.js';
import UserModel from './models/user.model.js';
const port = process.env.PORT || 3000;

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.use(async (socket, next) => {

    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        const projectId = socket.handshake.query?.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new Error('Invalid Project Id');
        }
        if (!token) {
            throw new Error('Unauthorized access, token not found');
        }

        socket.project = await projectModel.findById(projectId);

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) {
            throw new Error('Unauthorized access');
        }

        socket.user = decoded;
        next();
    } catch (error) {
        console.log(error);
    }
})

io.on('connection', socket => {
    console.log('A user connected 👽')

    socket.roomId = socket.project._id.toString();
    socket.join(socket.roomId);

    socket.on('project-message', async (data) => {

        let { message } = data;
        
        socket.broadcast.to(socket.roomId).emit('project-message', data);

        if (message && message.includes("@ai")) {
            message = message.replace("@ai", "");

            const response = await generateResult(message);
            io.to(socket.roomId).emit('project-message', {
                message: response,
                sender :{
                    _id : 'ai',
                    email : 'Ai'
                }
            })
        }

    })

    socket.emit('request', /* … */); // emit an event to the socket
    io.emit('broadcast', /* … */); // emit an event to all connected sockets
    socket.on('reply', () => { /* … */ }); // listen to the event
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})