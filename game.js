var players = {};
var comm = require('./communication.js');
var util = require('./player_util.js')
var nextId = 0;

exports.init = function (app)
{
  comm.init(app, this);
}

exports.onNewPlayer = function (data, cb)
{
  player = 
    {
      name: data.name,
      id: nextId,
      x: 100, // TODO: spawnpoint random or from map
      y: 10,
      height: 50,
      width: 50,
      Health: 100,
      color: get_random_color()
    };
  
  nextId++;
  
  console.log("Player joined: " + player.name + ", " + player.id);
  
  // tell the socket its ID
  cb(player.id);
  
  // show the new client all the old clients
  for(var id in players)
  {
    comm.emit(player.id, 'PLAYER_JOINED', players[id]);
  }
  
  // save the generated player-object
  players[player.id] = player;
  
  // show the old clients the new client
  comm.broadcast('PLAYER_JOINED', player);
}

exports.onPlayerLeft = function (id)
{
  console.log("Player left: " + players[id].name + ", " + id);
  delete players[id];
  comm.broadcast('PLAYER_LEFT', { id: id });
}

exports.onPacket = function (id, type, data)
{
  if(type == "MOVE")
  {
    var player = players[id];
    var colls = util.getCollisions(players, player, data);
    if(colls.length != 0)
      return;
    
    player.x += data.x;
    player.y += data.y;
    comm.broadcast('PLAYER_MOVED',
      {
        id: player.id,
        x: data.x,
        y: data.y
      });
  }
}

function get_random_color()
{
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}