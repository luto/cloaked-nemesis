var comm = require('communication.js');
var util = require('/player_util.js');
var types = require('/types.js');
var entities = {};

// collie.js
var c_layer_players;
var c_players = {};

exports.init = function()
{
  comm.init();
  comm.listen('PLAYER_JOINED', handlePlayerJoined);
  comm.listen('PLAYER_LEFT', handlePlayerLeft);
  comm.listen('PHYSICS', handlePhysicsUpdate);
  comm.listen('HELLO', handleHello);
};

function handleHello(data)
{
  document.addEventListener('keydown', handleKeyDown);
  
  c_layer_players = new collie.Layer({ width: data.worldSize.width,
                                       height: data.worldSize.height });
  
  collie.Renderer.addLayer(c_layer_players);
  collie.Renderer.load($("#game")[0]);
  collie.Renderer.start("30fps");
}

function handlePlayerJoined(entity)
{
  entity = types.getObj(entity.__type, entity);
  entities[entity.id] = entity;
  
  if(entity instanceof types.t_Player)
    createPlayer(entity);
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

function setPlayerPos(player)
{
  c_players[player.id].set(
    {
      x : player.x,
      y : player.y,
    });
}

function handleKeyDown(evt)
{
  var dist = 300;
  if(evt.keyCode == 37) // left
  {
    comm.sendMove(dist * -1, 0);
  }
  else if(evt.keyCode == 38) // up
  {
    comm.sendMove(0, dist * -1);
  }
  else if(evt.keyCode == 39) // right
  {
    comm.sendMove(dist, 0);
  }
  else if(evt.keyCode == 40) // down
  {
    comm.sendMove(0, dist);
  }
}
