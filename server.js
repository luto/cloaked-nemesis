var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , static = require('node-static');

app.listen(8080);
var file = new(static.Server)();

function handler (req, res) {
  if(req.url == "/")
    req.url = "/index.html"
  file.serve(req, res);
}

io.sockets.on('connection', newConnection);

var players = [];
var sockets = [];

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
          id: players.length,
          X: 100,
          Y: 10,
          Health: 100,
          color: get_random_color()
        };
      
      // show the new client all the old clients
      for(var i = 0; i < players.length; i++)
      {
        socket.emit('NEW_PLAYER', players[i]);
      }
      
      players.push(player);
      sockets.push(socket);
      
      // show the old clients the new client
      broadcast('NEW_PLAYER', player);
    });

  socket.on('MOVE', function(data)
    {
      player.X += data.X;
      player.Y += data.Y;
      broadcast('PLAYER_MOVED',
        {
          id: player.id,
          X: data.X,
          Y: data.Y
        });
    });
}

function broadcast(type, msg, except)
{
  for(var i = 0; i < sockets.length; i++)
  {
    if(sockets[i] != except)
      sockets[i].emit(type, msg);
  }
}












