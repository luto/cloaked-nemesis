var game;
var tick;
var maxWorldSize;
var currentGamePos;

// collie.js
var c_layer_static;
var c_layer_players;
var c_players = {};
var world;

exports.init = function (_game, _tick)
{
  game = _game;
  tick = _tick;
}

exports.start = function (_worldSize, _maxWorldSize)
{
  maxWorldSize = _maxWorldSize;

  // center on page, see also game.css
  $("#game").css("margin-left", _maxWorldSize.width / -2);
  collie.Renderer.setRenderingMode('dom');
  c_layer_players = new collie.Layer({ width: maxWorldSize.width,
                                       height: maxWorldSize.height });
  c_layer_static = new collie.Layer({ width: maxWorldSize.width,
                                       height: maxWorldSize.height });
  
  world = new collie.DisplayObject({ backgroundColor : '#FFA6C9' });
  world.addTo(c_layer_static);
  handleWorldSizeChange(_worldSize);

  collie.Renderer.addLayer(c_layer_static);
  collie.Renderer.addLayer(c_layer_players);
  collie.Renderer.load($("#game")[0]);
  collie.Renderer.start("30fps", tick);
}

function handleWorldSizeChange(worldSize)
{
  currentGamePos = {};
  currentGamePos.x = maxWorldSize.width / 2 - worldSize.width / 2;
  currentGamePos.y = 0;

  world.set(
    {
      width : worldSize.width,
      height : worldSize.height,
      x : currentGamePos.x,
      y : currentGamePos.y
    });

  c_layer_players.offset(maxWorldSize.width / 2 - worldSize.width / 2)
}

exports.addPlayer = function (player)
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

exports.removePlayer = function (id)
{
  for(var sub in c_players[id])
    c_layer_players.removeChild(c_players[id][sub]);
  delete c_players[id];
}

exports.setEntityPos = function (entity)
{
  if(entity instanceof game.types.t_Player)
    setPlayerPos(entity);
}

exports.getCurrentGamePos = function ()
{
  return currentGamePos;
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
