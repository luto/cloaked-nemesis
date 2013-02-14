var comm = require('communication.js');
var gameConsole = require('gameConsole.js');
var playerList = require('playerList.js');
var util = require('/player_util.js');
var types = require('/types.js');
var entities = {};
var worldSize;
var battleFieldSize;
var pressedKeys = {};
var startCallback;

// collie.js
var c_layer_players;
var c_players = {};
var battlefield;

exports.init = function()
{
  comm.init();
  gameConsole.init();
  playerList.init();

  comm.listen('ADD_ENTITY', handleAddEntity);
  comm.listen('REMOVE_ENTITY', handleRemoveEntity);
  comm.listen('DIE_ENTITY', handleDieEntity);
  comm.listen('RESPAWN_ENTITY', handleRespawnEntity);
  comm.listen('PHYSICS', handlePhysicsUpdate);
  comm.listen('CHAT', handleChat);
  comm.listen('HELLO', handleHello);
  comm.connect();
};

exports.start = function(nickname, cb)
{
  startCallback = cb;
  comm.sendHello(nickname);
}

exports.sendChatMessage = function (message)
{
  comm.sendChatMessage(message);
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
  switch(data.step)
  {
    case 0:
      worldSize = data.worldSize;
      battleFieldSize = data.battleFieldSize;
      break;
    case 1:
      stepOneHelloReceived(data.error);
      break;
  }
}

function stepOneHelloReceived(error)
{
  startCallback(error);
  
  if(error)
    return;

  // input
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // collie.js
  $("#game").css("margin-left", worldSize.width / -2);
  collie.Renderer.setRenderingMode('dom');
  c_layer_players = new collie.Layer({ width: worldSize.width,
                                       height: worldSize.height });
  
  collie.Renderer.addLayer(c_layer_players);
  collie.Renderer.load($("#game")[0]);
  collie.Renderer.start("30fps", collieTick);

  battleField = new collie.DisplayObject({ backgroundColor : '#FFA6C9' });
  handleBattlefieldChange(battleFieldSize);
  battleField.addTo(c_layer_players);

  // panels
  var gamePos = $("#game").position();
  gameConsole.setPos(battleFieldSize.width + battleFieldSize.x + 10, battleFieldSize.y);
  playerList.setPos(-50, battleFieldSize.y);

}

function handleAddEntity(data)
{
  var entity = types.getObj(data.entity.__type, data.entity);
  entities[entity.id] = entity;
  
  if(entity instanceof types.t_Player)
  {
    createPlayer(entity);
    gameConsole.playerJoined(entity.name);
    playerList.addPlayer(entity.name, entity.color, entity.score);
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

function handleRemoveEntity(data)
{
  var entity = entities[data.id];

  if(entity instanceof types.t_Player)
  {
    gameConsole.playerLeft(entity.name);
    playerList.removePlayer(entity.name);

    for(var sub in c_players[data.id])
      c_layer_players.removeChild(c_players[data.id][sub]);
    delete c_players[data.id];
  }

  delete entities[data.id];
}

function handleDieEntity(data)
{
  var entity = entities[data.id];

  if(entity instanceof types.t_Player)
  {
    entity.alive = false;
    gameConsole.playerDied(entity.name);
    playerList.killPlayer(entity.name);
    entity.score--;
    playerList.setScoreOfPlayer(entity.name, entity.score);
  }
}

function handleRespawnEntity(data)
{
  var entity = entities[data.id];

  if(entity instanceof types.t_Player)
  {
    entity.alive = true;
    playerList.spawnPlayer(entity.name);
  }
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
  gameConsole.chatMessage(name, data.message);
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
