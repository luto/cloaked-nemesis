var comm = require('communication.js');
var util = require('/player_util.js');
var players = [];

// collie.js
var c_layer_players;
var c_players = [];

exports.init = function()
{
	comm.init();
	comm.listen('NEW_PLAYER', handleNewPlayer);
	comm.listen('REMOVE_PLAYER', handleRemovePlayer);
	comm.listen('PLAYER_MOVED', handlePlayerMoved);
	document.addEventListener('keydown', handleKeyDown);
	
	c_layer_players = new collie.Layer({ width: 320, height: 480 });
	collie.Renderer.addLayer(c_layer_players);
	collie.Renderer.load($("#game")[0]);
	collie.Renderer.start("30fps");
};

function handleNewPlayer(player)
{
	players.push(player);
	createPlayer(player);
}

function createPlayer(player)
{
	var c_player = new collie.MovableObject(
		{
			width : 50,
			height : 50,
			mass: 1,
			backgroundColor: player.color,
		});
	
	c_players[player.id] = c_player;
	setPlayerPos(player);
	c_player.addTo(c_layer_players);
}

function handleRemovePlayer(args)
{
  util.removePlayerById(players, args.id);
  $("#player_" + args.id).remove();
}

function handlePlayerMoved(data)
{
	var player = util.getPlayerById(players, data.id);
	player.X += data.X;
	player.Y += data.Y;
  setPlayerPos(player);
}

function setPlayerPos(player)
{
	c_players[player.id].set(
		{
			x : player.X,
			y : player.Y,
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
