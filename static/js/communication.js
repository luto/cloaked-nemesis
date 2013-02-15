var socket;
var game;

exports.init = function (_game)
{
  game = _game;
}

exports.connect = function ()
{
  socket = io.connect('http://' + window.location.hostname + ':' + window.location.port);
  socket.on('HELLO', onHello);
  socket.on('PAK', onPacket);
}

exports.listen = function (evt, func)
{
  if(!eventListeners[evt])
    throw "No such event!";

   eventListeners[evt].push(func);
}

exports.sendMove = function (direction)
{
  socket.emit('PAK', { type: 'MOVE', data: { direction: direction }});
}

exports.sendHello = function (nickname, color, uid)
{
  socket.emit('HELLO', { name: nickname, color: color, uid: uid });
}

exports.sendChatMessage = function (message)
{
  socket.emit('PAK', { type: 'CHAT', data: { message: message }});
}

function onHello(pak)
{
  switch(pak.step)
  {
    case 0:
      game.onStepZeroHello(pak.worldSize, pak.battleFieldSize);
      break;
    case 1:
      game.onStepOneHello(pak.error);
      break;
  }
}

function onPacket(pak)
{
  switch(pak.type)
  {
    case "ADD_ENTITY":
      game.handleAddEntity(pak.data.entity);
      break;
    case "REMOVE_ENTITY":
      game.handleRemoveEntity(pak.data.id);
      break;
    case "DIE_ENTITY":
      game.handleDieEntity(pak.data.id);
      break;
    case "RESPAWN_ENTITY":
      game.handleRespawnEntity(pak.data.id);
      break;
    case "PHYSICS":
      game.handlePhysicsUpdate(pak.data.bodies);
      break;
    case "CHAT":
      game.handleChat(pak.data.sender, pak.data.message);
      break;
  }
}

