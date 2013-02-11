var comm = require('communication.js');
var gameConsole = require('gameConsole.js');
var util = require('/player_util.js');
var types = require('/types.js');
var entities = {};
var worldSize;
var pressedKeys = {};

// collie.js
var c_layer_players;
var c_players = {};

exports.init = function()
{
  comm.init();
  gameConsole.init();

  comm.listen('PLAYER_JOINED', handlePlayerJoined);
  comm.listen('PLAYER_LEFT', handlePlayerLeft);
  comm.listen('PHYSICS', handlePhysicsUpdate);
  comm.listen('CHAT', handleChat);
  comm.listen('HELLO', handleHello);
  comm.connect();
};

exports.start = function(nickname)
{
  // socket.io
  comm.sendHello(nickname);

  // input
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // collie.js
  collie.Renderer.setRenderingMode('dom');
  c_layer_players = new collie.Layer({ width: worldSize.width,
                                       height: worldSize.height });
  
  collie.Renderer.addLayer(c_layer_players);
  collie.Renderer.load($("#game")[0]);
  collie.Renderer.start("30fps", collieTick);
}

exports.sendChatMessage = function (msg)
{
  comm.sendChatMessage(msg);
}

function handleHello(data)
{
  worldSize = data.worldSize;
}

function handlePlayerJoined(entity)
{
  entity = types.getObj(entity.__type, entity);
  entities[entity.id] = entity;
  
  if(entity instanceof types.t_Player)
  {
    createPlayer(entity);
    gameConsole.playerJoined(entity.name);
  }
}

function createPlayer(player)
{
  var c_player = new collie.MovableObject(
    {
      width : player.width,
      height : player.height,
      mass: 1,
      backgroundColor: player.color,
    });
  
  c_players[player.id] = c_player;
  setPlayerPos(player);
  c_player.addTo(c_layer_players);
}

function handlePlayerLeft(data)
{
  if(entities[data.id] instanceof types.t_Player)
    gameConsole.playerLeft(entities[data.id].name);

  c_layer_players.removeChild(c_players[data.id]);
  delete c_players[data.id];
  delete entities[data.id];
}

function handlePhysicsUpdate(data)
{
  for(var id in data.bodies)
  {
    entities[id].x = data.bodies[id].x;
    entities[id].y = data.bodies[id].y;
    
    setPlayerPos(entities[id]);
  }
}

function handleChat(data)
{
  var name = entities[data.sender].name;
  gameConsole.chatMessage(name, data.msg);
}

function setPlayerPos(player)
{
  c_players[player.id].set(
    {
      x : player.x,
      y : player.y,
    });
}

function handleKeyUp(evt)
{
  pressedKeys[evt.keyCode] = false;
}

function handleKeyDown(evt)
{
  pressedKeys[evt.keyCode] = true;
}

function collieTick(frame, skippedFrame, fps, duration)
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
