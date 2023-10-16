import express from "express";
import logger from "morgan"; 
import dotenv from 'dotenv'
import { createClient } from "@libsql/client";

import { createServer } from "node:http"; //importa el modulo http de node
import { Server } from "socket.io"; //importa el modulo socket.io

dotenv.config()

const port = process.env.PORT ?? 3000

const app = express();
const server = createServer(app); // create an http server with express
const io = new Server(server, {
    connectionStateRecovery : {}
}); //creates a socket server with the http server (const server)

const db = createClient({
    url: "libsql://probable-raphael-sofiafernands.turso.io",
    authToken: process.env.DB_TOKEN,
})

await db.execute(`
    CREATE TABLE IF NOT EXISTS messages( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT
        )
    `)

//connection new user
io.on('connection', (socket) => {
    console.log('New connection');
    //disconnet user
    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
    //send message
    socket.on('chat message', async (msg) => {
        
        try { 
            let result;
    await db.execute({
        sql: `INSERT INTO messages (content) VALUES (:msg)`,
        args: { msg },
    });
    }
    catch (error) {
        console.error(error);
        return;
    }
    io.emit('chat message', msg, result.lastInsertRowid.toString());
    })
});

app.use(logger('dev'));

app.get('/', (req, res) => {
    //cwd(currente working directory) is the folder in which the process(node) has been initialized, in this case it is the client folder.
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
