import express from "express";
import logger from "morgan";

const port = process.env.PORT ?? 3000

const app = express();
app.use(logger('dev'));

app.get('/', (req, res) => {
    //cwd(currente working directory) es la carpeta en la que se inicializado el proceso(node) en este caso es la carpeta client
    res.sendFile(process.cwd() + '/client/index.html')
})

app.listen(port, () => {
    console.log('Server running on port ${port}')
})
