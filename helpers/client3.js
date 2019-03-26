const io = require('socket.io-client');

const ioClient = io.connect('http://localhost:3001');

// ioClient.on('seq-num', msg => console.info(msg));
ioClient.emit('broadcast', 'send')
// ioClient.emit('set nickname', name, function (success) {})
