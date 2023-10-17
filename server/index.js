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
        content TEXT,
        user TEXT 
        )
    `)

    //connection new user
io.on('connection', async (socket) => {
    console.log('New connection');

    //disconnet user
    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
    //send message
    socket.on('chat message', async (msg) => {
        let result;
        const username = socket.handshake.auth.username ?? 'anonymous';
     try { 
        result = await db.execute({
        sql: `INSERT INTO messages (content, user) VALUES (:msg, :username)`,
        args: { msg, username},
    });
    }
     catch (error) {
        console.error(error);
        return;
    }

    io.emit('chat message', msg, result.lastInsertRowid.toString(), username );
    })
    console.log('auth')
    console.log(socket.handshake.auth)
    //recover messages
    if (!socket.recovered) {        
        try {
            const result = await db.execute ({
                sql: 'SELECT id, content, user  FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0],
            })

            result.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString(), row.user)
            })
        }
        catch (error) {
            console.error(error);
            return;
        }
    }
});

    app.use(logger('dev'));

    app.get('/', (req, res) => {
        //cwd(currente working directory) is the folder in which the process(node) has been initialized, in this case it is the client folder.
        res.sendFile(process.cwd() + '/client/index.html')
    })

    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    })
