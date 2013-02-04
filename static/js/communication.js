var socket;
var eventListeners = [];

exports.init = function ()
{
	eventListeners["PLAYER_JOINED"] = [];
	eventListeners["PLAYER_LEFT"] = [];
	eventListeners["PLAYER_MOVED"] = [];
	
	socket = io.connect('http://' + window.location.hostname + ':' + window.location.port);
	socket.emit('HELLO', { name: 'luto' });
	socket.on('PAK', onPacket);
};

exports.listen = function (evt, func)
{
	if(!eventListeners[evt])
 	 throw "No such event!";

 	eventListeners[evt].push(func);
}

exports.sendMove = function (x, y)
{
	socket.emit('PAK', { type: 'MOVE', data: { x: x, y: y }});
}

function onPacket(pak)
{
	triggerEvent(pak.type, pak.data);
}

function triggerEvent(evt, arg)
{
	for(var func in eventListeners[evt])
	{
		eventListeners[evt][func](arg);
	}
}
