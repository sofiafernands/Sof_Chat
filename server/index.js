import express from "express";
import logger from "morgan"; 

import { createServer } from "node:http"; //importa el modulo http de node
import { Server } from "socket.io"; //importa el modulo socket.io

const port = process.env.PORT ?? 3000

const app = express();
const server = createServer(app); // create an http server with express
const io = new Server(server, {
    connectionStateRecovery : {}
}); //creates a socket server with the http server (const server)

//connection new user
io.on('connection', (socket) => {
    console.log('New connection');
//disconnet user
    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
    socket.on('chat message', (msg) => {
        io.emit('chat message',  msg)})
});

app.use(logger('dev'));

app.get('/', (req, res) => {
    //cwd(currente working directory) is the folder in which the process(node) has been initialized, in this case it is the client folder.
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
    console.log('Server running on port ${port}')
})
