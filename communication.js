var socketio = require('socket.io');
var io;
var sockets = {};
var game;

exports.init = function(_app, _game)
{
  game = _game;
  io = socketio.listen(_app);
  io.set('log level', 1);
  io.sockets.on('connection', newConnection);
}

exports.broadcast = function(type, data, except)
{
  var msg = { type: type, data: data };
  
  for(var id in sockets)
  {
    if(sockets[id] != except)
      sockets[id].emit('PAK', msg);
  }
}

exports.emit = function(id, type, data)
{
  sockets[id].emit('PAK', { type: type, data: data });
}

function newConnection(socket)
{
  var id = -1;

  game.onNewConnection(socket);
  
  socket.on('HELLO', function (data)
    {
      game.onNewPlayer(data, function (data)
        {
          if(data == -1)
          {
            socket.disconnect();
          }
          else
          {
            id = data;
            sockets[id] = socket;
            socket.on('PAK', function (data) { onPacket(id, data); });
          }
        })
    });
  
  socket.on('disconnect', function ()
    {
      if(id == -1)
        return;
      
      delete sockets[id];
      game.onPlayerLeft(id);
    });
}

function onPacket(id, pak)
{
  game.onPacket(id, pak.type, pak.data)
}
