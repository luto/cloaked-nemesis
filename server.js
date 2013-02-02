var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  var url = req.url;
  if(url == '/')
    url = '/index.html';
  
  fs.readFile(__dirname + url,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + url);
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', newConnection);

var players = [];
var sockets = [];

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
          Health: 100
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












