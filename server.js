var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , static = require('node-static')
  , util = require('./player_util.js');

app.listen(8080);
var file = new(static.Server)();

function handler (req, res) {
  if(req.url == "/")
    req.url = "/index.html"
  file.serve(req, res);
}

io.sockets.on('connection', newConnection);

var players = {};
var sockets = {};
var nextId = 0;

function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function newConnection(socket)
{
  var player;

  socket.on('HELLO', function(data)
    {
      player = 
        {
          name: data.name,
          id: nextId,
          x: 100,
          y: 10,
          height: 50,
          width: 50,
          Health: 100,
          color: get_random_color()
        };
      nextId++;
      
      // show the new client all the old clients
      for(var id in players)
      {
        socket.emit('NEW_PLAYER', players[id]);
      }
      
      players[player.id] = player;
      sockets[player.id] = socket;
      
      // show the old clients the new client
      broadcast('NEW_PLAYER', player);
    });

  socket.on('MOVE', function(data)
    {
      var colls = util.getCollisions(players, player, data);
      if(colls.length != 0)
        return;
      
      player.x += data.x;
      player.y += data.y;
      broadcast('PLAYER_MOVED',
        {
          id: player.id,
          x: data.x,
          y: data.y
        });
    });
  
  socket.on('disconnect', function(data)
    {
      if(!player)
        return;
      
      delete players[player.id];
      broadcast('REMOVE_PLAYER', { id: player.id });
    });
}

function broadcast(type, msg, except)
{
  for(var id in sockets)
  {
    if(sockets[id] != except)
      sockets[id].emit(type, msg);
  }
}












