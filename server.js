const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const app = express();
app.use(express.static('client'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);

app.get('/', async (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});
app.get('/idk', async (req, res) => {
    res.sendFile(__dirname + '/client/idk.html');
});
app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/client/404.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});