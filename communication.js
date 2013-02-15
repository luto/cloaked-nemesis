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
      if(!data.name)
        return;
      if(!data.color)
        return;
      if(!data.uid)
        return;
      
      game.onNewPlayer(data, function (newId, error)
        {
          if(error)
          {
            socket.emit('HELLO', { step: 1, error: error });
          }
          else
          {
            socket.emit('HELLO', { step: 1, error: null });
            id = newId;
            sockets[id] = socket;
            socket.on('PAK', function (data) { onPacket(id, data); });
            socket.removeAllListeners('HELLO');
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
  if(!pak.data)
    return;

  switch(pak.type)
  {
    case "MOVE":
      if(!pak.data.direction)
        return;
      game.onMove(id, pak.data.direction);
      break;
    case "CHAT":
      if(!pak.data.message)
        return;
      game.onChat(id, pak.data.message);
      break;
  }
}

exports.onPhysics = function (bodies)
{
  exports.broadcast('PHYSICS', { bodies: bodies });
}

exports.onChat = function (sender, message)
{
  exports.broadcast('CHAT', { message: message, sender: sender });
}

exports.onAddEntity = function (entity, id)
{
  var copyentity = {};
  for (var attr in entity)
  {
      if (entity.hasOwnProperty(attr) && attr != "uid")
        copyentity[attr] = entity[attr];
  }

  if(id)
    exports.emit(player.id, 'ADD_ENTITY', { entity: copyentity });
  else
    exports.broadcast('ADD_ENTITY', { entity: copyentity });
}

exports.onRemoveEntity = function (id)
{
  exports.broadcast('REMOVE_ENTITY', { id: id });
}
