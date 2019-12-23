const express = require('express');
const { getUserContext } = require('./api/fittings/user_context');
const app = express();
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const PUBLIC = path.join(__dirname, 'public');
app.use(express.static(PUBLIC));
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Expose-Headers', '*');
    getUserContext(req,res,next)
    next();
});
function loggerMiddleware(req, res,next) {
    console.log("in midlware",req.body);
    next();
}
app.post('/events',loggerMiddleware, function (req, res) {
    res.send({text: 'Hello World!'})
})

console.log('app started..');
/**
 * Swagger initialization on top of express
 */

console.log('[lifecycle]: core service is booting up');

const port = process.env.PORT || 5000;
console.log('[lifecycle]: core service is now listening', {
    port,
});

app.get('/health', function(request, response) {
    console.log('got request for path /health ');
    response.send({health:'ok',
        serverCurrentTimeAsString: `${new Date()}`,
        serverCurrentTime: (new Date()),
        nodeVersion: process.version}
    );
});

const server = http.createServer(app);
const io = socketIO.listen(server);

server.listen(5000, function() {
    console.log('### startListening ##');
    console.log(`Node app is running on port:  5000`);
    io.on('connection', function (socket) {
        console.log(`a user connected`);
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
        socket.on('chat message', function(msg){
            console.log('message: ' + msg);
            socket.emit('chat response', "cool i'm server");
        });
    });
});


module.exports = {
    server
};
