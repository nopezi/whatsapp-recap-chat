const socketIO = require('socket.io');

const socketController = (server) => {
    const io = socketIO(server)
}

module.exports = socketController