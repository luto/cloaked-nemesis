var comm = require('communication.js');
var gameConsole = require('gameConsole.js');
var playerList = require('playerList.js');
var graphics = require('graphics.js');
var types = require('/types.js');
var entities = {};
var worldSize;
var maxWorldSize;
var pressedKeys = {};
var startCallback;

exports.init = function()
{
  comm.init(this);
  gameConsole.init();
  playerList.init();
  graphics.init(this, tick);
  comm.connect();
}

exports.types = types;

exports.start = function(nickname, color, uid, cb)
{
  startCallback = cb;
  comm.sendHello(nickname, color, uid);
}

exports.sendChatMessage = function (message)
{
  comm.sendChatMessage(message);
}

exports.onStepZeroHello = function (_worldSize, _maxWorldSize)
{  
  worldSize = _worldSize;
  maxWorldSize = _maxWorldSize;
}

exports.onStepOneHello = function (error)
{
  startCallback(error);
  
  if(error)
    return;

  // input
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // start collie
  graphics.start(worldSize, maxWorldSize);

  // panels
  var gamePos = graphics.getCurrentGamePos();
  gameConsole.setPos(gamePos.x + worldSize.width + 10, gamePos.y + 5);
  playerList.setPos(gamePos.x - 100, gamePos.y + 5);
}

exports.handleAddEntity = function (entity)
{
  entity = types.getObj(entity.__type, entity);
  entities[entity.id] = entity;
  
  if(entity instanceof types.t_Player)
  {
    graphics.addPlayer(entity);
    gameConsole.addPlayer(entity.name);
    playerList.addPlayer(entity.name, entity.color, entity.score);
  }
}

exports.handleRemoveEntity = function (id)
{
  var entity = entities[id];

  if(entity instanceof types.t_Player)
  {
    gameConsole.removePlayer(entity.name);
    playerList.removePlayer(entity.name);
    graphics.removePlayer(id);
  }

  delete entities[data.id];
}

exports.handleDieEntity = function (id)
{
  var entity = entities[id];

  if(entity instanceof types.t_Player)
  {
    entity.alive = false;
    gameConsole.killPlayer(entity.name);
    playerList.killPlayer(entity.name);
    entity.score--;
    playerList.setScoreOfPlayer(entity.name, entity.score);
  }
}

exports.handleRespawnEntity = function (id)
{
  var entity = entities[id];

  if(entity instanceof types.t_Player)
  {
    entity.alive = true;
    playerList.spawnPlayer(entity.name);
  }
}

exports.handlePhysicsUpdate = function (bodies)
{
  for(var id in bodies)
  {
    entities[id].x = bodies[id].x;
    entities[id].y = bodies[id].y;
    graphics.setEntityPos(entities[id]);
  }
}

exports.handleChat = function (sender, message)
{
  var name = entities[sender].name;
  gameConsole.chatMessage(name, message);
}

function handleKeyUp(evt)
{
  pressedKeys[evt.keyCode] = false;
}

function handleKeyDown(evt)
{
  pressedKeys[evt.keyCode] = true;
}

function tick(frame, skippedFrame, fps, duration)
{
  if(pressedKeys[37]) // left
  {
    comm.sendMove('left');
  }
  else if(pressedKeys[38]) // up
  {
    comm.sendMove('up');
  }
  else if(pressedKeys[39]) // right
  {
    comm.sendMove('right');
  }
  else if(pressedKeys[40]) // down
  {
    comm.sendMove('down');
  }
}
