var comm = require('communication.js');
var gameConsole = require('gameConsole.js');
var util = require('/player_util.js');
var types = require('/types.js');
var entities = {};
var worldSize;
var battleFieldSize;
var pressedKeys = {};

// collie.js
var c_layer_players;
var c_players = {};
var battlefield;

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

  battleField = new collie.DisplayObject({ backgroundColor : '#FFA6C9' });
  handleBattlefieldChange(battleFieldSize);
  battleField.addTo(c_layer_players);

  // messages
  gameConsole.setPos(worldSize.width + 30, 20);
}

exports.sendChatMessage = function (msg)
{
  comm.sendChatMessage(msg);
}

function handleBattlefieldChange(battleFieldSize)
{
  battleField.set(
    {
      width : battleFieldSize.width,
      height : battleFieldSize.height,
      x : battleFieldSize.x,
      y : battleFieldSize.y
    });
}

function handleHello(data)
{
  worldSize = data.worldSize;
  battleFieldSize = data.battleFieldSize;
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
  var square = new collie.MovableObject(
    {
      width: player.width,
      height: player.height,
      mass: 1,
      backgroundColor: player.color,
    });
  
  var name = new collie.Text(
    {
      width: player.width,
      height: 13,
      fontSize: 13,
      fontColor: "#FFF",
      textAlign: "center"
    });

  name.text(player.name);

  c_players[player.id] = { square: square, name: name };

  setPlayerPos(player);
  for(var sub in c_players[player.id])
    c_players[player.id][sub].addTo(c_layer_players);
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
  c_players[player.id]["square"].set(
    {
      x : player.x,
      y : player.y,
    });
  c_players[player.id]["name"].set(
    {
      x : player.x,
      y : player.y + 32,
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
