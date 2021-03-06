(function () {
  'use strict';

  var server = require('./server'),
      io = require('socket.io')(server),
      rooms = io.sockets.adapter.rooms,
      clients = {};

  io.on('connection', function (socket) {

    socket.on('create or join', function (room) {

      // create a room if it doesn't exist
      if (!(room in rooms)) {
        socket.join(room);
        socket.emit('created', {
          room: room,
          id: socket.id
        });
        console.log('created room', room);

        // Add to list of clients
        clients[socket.id] = {};
      } else {

        // join the room if it's not full
        var numClients = Object.keys(rooms[room]).length;
        if (numClients < 8) {
          socket.join(room);
          // notify yourself and others in the room
          socket.emit('joined', {
            room: room,
            id: socket.id
          });
          socket.to(room).emit('join', {
            room: room,
            id: socket.id
          });
          console.log('joined room', room);

          // Add to list of clients
          clients[socket.id] = {};
        } else { // max number of clients
          console.log('room', room, 'is full');
        }
      }
    });

    socket.on('message', function (room, message) {
      console.log(room, message);
      socket.to(room).emit('message', message);
    });

    socket.on('request enemy data', function (room) {
      console.log('sending enemy data for room', room);
      var enemies = Object.keys(rooms[room]);
      socket.emit('enemy data', enemies);
    });

    socket.on('handle input', function (room, input) {
      console.log('getting input', input, 'for room', room);

      socket.to(room).emit('update client', socket.id, input);
      clients[socket.id].laststate = input;

      //keep last known state so we can send it to new connected clients
      socket.emit('enemy data', enemies);
    });

  });

  module.exports = io;

}).call(this);
