var comm = require('communication.js');
var players = [];
var game$ = $("#game");

exports.init = function()
{
	comm.init();
	comm.listen('NEW_PLAYER', handleNewPlayer);
	comm.listen('PLAYER_MOVED', handlePlayerMoved);
	document.addEventListener('keydown', handleKeyDown);
};

function handleNewPlayer(player)
{
	players.push(player);
	console.log("New Player: " + player.id)
	
	game$.append('<div id="player_' + player.id + '"></div>');
	$("#player_" + player.id)
	  .addClass('player')
	  .css('color', player.color)
	  .text(player.id);
	setPlayerPos(player);
}

function handlePlayerMoved(data)
{
	var player = players[data.id];
	player.X += data.X;
	player.Y += data.Y;
  setPlayerPos(player);
}

function setPlayerPos(player)
{
	$("#player_" + player.id)
		.css('top', player.Y)
		.css('left', player.X);
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
