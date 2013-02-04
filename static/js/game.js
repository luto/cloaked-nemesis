var comm = require('communication.js');
var util = require('/player_util.js');
var players = {};

// collie.js
var c_layer_players;
var c_players = {};

exports.init = function()
{
	comm.init();
	comm.listen('PLAYER_JOINED', handlePlayerJoined);
	comm.listen('PLAYER_LEFT', handlePlayerLeft);
	comm.listen('PLAYER_MOVED', handlePlayerMoved);
	document.addEventListener('keydown', handleKeyDown);
	
	c_layer_players = new collie.Layer({ width: 320, height: 480 });
	collie.Renderer.addLayer(c_layer_players);
	collie.Renderer.load($("#game")[0]);
	collie.Renderer.start("30fps");
};

function handlePlayerJoined(player)
{
	players[player.id] = player;
	createPlayer(player);
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
  delete players[data.id];
}

function handlePlayerMoved(data)
{
	var player = players[data.id];
	player.x += data.x;
	player.y += data.y;
  setPlayerPos(player);
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
	var dist = 3;
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
