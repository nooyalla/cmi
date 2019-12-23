const createSocket = () => {

  console.log('establishing client socket');

  try {
    const socket = io();
    socket.emit('chat message', "hi i'm client");
    socket.on('chat response', function(msg){
      console.log('response: ' + msg);
    });
  } catch (err) {
    console.log('failed to create/emit socket io', err);
  }
};

setTimeout(createSocket, 1000);
