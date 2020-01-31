const express = require('express');
app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http)
const path = require('path');

const users = {};

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '../client/index.html'));
});

io.on('connection', function(socket){
  socket.broadcast.emit('user update', "User joined")

  users[socket.id] = {
    "id": socket.id,
    "name": ""
  }

  socket.on('disconnect', function(){
    var user = users[socket.id]
    socket.broadcast.emit('user update', `${user.name === '' ? 'User' : user.name } left`)
  });

  socket.on('chat message', function(msg){
    var user = users[socket.id]
    socket.broadcast.emit('chat message', {
      "message": msg,
      "user": user.name === '' ? 'User' : user.name,
    })
  });

  socket.on('change name', function(msg){
    var user = users[socket.id]
    socket.broadcast.emit('user update', `${user.name === '' ? 'User' : user.name } changed name to ${msg}`)
    user.name = msg
  })

  socket.on('typing', function(msg){
    var user = users[socket.id]
    socket.broadcast.emit('user update',
     `${user.name === '' ? 'User' : user.name } ${msg === true ? 'is typing' : 'stopped typing'}`)
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});