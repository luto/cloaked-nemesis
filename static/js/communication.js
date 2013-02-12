var socket;
var eventListeners = [];

exports.init = function ()
{
  eventListeners["HELLO"] = [];
  eventListeners["ADD_ENTITY"] = [];
  eventListeners["REMOVE_ENTITY"] = [];
  eventListeners["DIE_ENTITY"] = [];
  eventListeners["PHYSICS"] = [];
  eventListeners["CHAT"] = [];
}

exports.connect = function ()
{
  socket = io.connect('http://' + window.location.hostname + ':' + window.location.port);
  socket.on('HELLO', onHello);
  socket.on('PAK', onPacket);
}

exports.listen = function (evt, func)
{
  if(!eventListeners[evt])
    throw "No such event!";

   eventListeners[evt].push(func);
}

exports.sendMove = function (direction)
{
  socket.emit('PAK', { type: 'MOVE', data: { direction: direction }});
}

exports.sendHello = function (nickname)
{
  socket.emit('HELLO', { name: nickname });
}

exports.sendChatMessage = function (msg)
{
  socket.emit('PAK', { type: 'CHAT', data: { msg: msg }});
}

function onHello(pak)
{
  triggerEvent('HELLO', pak);
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
