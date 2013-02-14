var game;
var tick;

// collie.js
var c_layer_players;
var c_players = {};
var battlefield;

exports.init = function (_game, _tick)
{
  game = _game;
  tick = _tick;
}

exports.start = function (worldSize, battleFieldSize)
{
  // collie.js
  $("#game").css("margin-left", worldSize.width / -2);
  collie.Renderer.setRenderingMode('dom');
  c_layer_players = new collie.Layer({ width: worldSize.width,
                                       height: worldSize.height });
  
  collie.Renderer.addLayer(c_layer_players);
  collie.Renderer.load($("#game")[0]);
  collie.Renderer.start("30fps", tick);

  battleField = new collie.DisplayObject({ backgroundColor : '#FFA6C9' });
  handleBattlefieldChange(battleFieldSize);
  battleField.addTo(c_layer_players);
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
