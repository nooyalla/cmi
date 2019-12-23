const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const socketIO = require('socket.io')(http);

const PUBLIC = path.join(__dirname, 'public');
app.use(express.static(PUBLIC));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Expose-Headers', '*');
    next();
});

console.log('app started..');
/**
 * Swagger initialization on top of express
 */

console.log('[lifecycle]: core service is booting up');

const port = process.env.PORT || 5000;
app.listen(port);
console.log('[lifecycle]: core service is now listening', {
    port,
});

socketIO.on('connection', function(socket){
    console.log('a user connected');
});

module.exports = {
    server: app,
};
