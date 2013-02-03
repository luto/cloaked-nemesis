var socket;
var eventListeners = [];

exports.init = function ()
{
	eventListeners["NEW_PLAYER"] = [];
	eventListeners["REMOVE_PLAYER"] = [];
	eventListeners["PLAYER_MOVED"] = [];
	
	socket = io.connect('http://' + window.location.hostname + ':' + window.location.port);
	socket.emit('HELLO', { name: 'luto' });

	socket.on('NEW_PLAYER', handleNewPlayer);
	socket.on('REMOVE_PLAYER', handleRemovePlayer);
	socket.on('PLAYER_MOVED', handlePlayerMoved);
};

exports.listen = function (evt, func)
{
	if(!eventListeners[evt])
 	 throw "No such event!";

 	eventListeners[evt].push(func);
}

exports.sendMove = function (x, y)
{
	socket.emit('MOVE', { x: x, y: y });
}

function handleNewPlayer(data)
{
	triggerEvent('NEW_PLAYER', data);
}

function handleRemovePlayer(data)
{
	triggerEvent('REMOVE_PLAYER', data);
}

function handlePlayerMoved(data)
{
	triggerEvent('PLAYER_MOVED', data);
}

function triggerEvent(evt, arg)
{
	for(var func in eventListeners[evt])
	{
		eventListeners[evt][func](arg);
	}
}
