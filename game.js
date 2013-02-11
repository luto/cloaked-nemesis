var comm = require('./communication.js');
var util = require('./player_util.js')
var types = require('./types.js');
require('./Box2dWeb-2.1.a.3.js');

// entities
var nextId = 0;
var entities = {};

// box2d
var world = null;
var tickInterval;
var fps = 60.0;
var timeStep = 1 / fps;
var bodies = {};

var mpp = 64;
var worldSize = { width: 500 / mpp, height: 500 / mpp }
var worldCenter = { x: worldSize.width / 2, y: worldSize.height / 2 }


exports.init = function (app)
{
  comm.init(app, this);
  Box2D.Common.b2Settings.b2_velocityThreshold = 0;
  world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 0), false);

  tickInterval = setInterval(worldStep, 1000 / fps);
}

exports.onNewConnection = function (socket)
{
  socket.emit('HELLO', { worldSize: { width: worldSize.width * mpp, height: worldSize.height * mpp } });
}

exports.onNewPlayer = function (data, cb)
{
  player = new types.t_Player(nextId);
  player.x = worldCenter.x * mpp - player.width / 2;
  player.y = worldCenter.y * mpp - player.height / 2;
  player.color = get_random_color();
  player.name = data.name;
  player.health = 100;
  
  nextId++;
  
  console.log("Player joined: " + player.name + ", " + player.id);
  
  // tell the socket its ID
  cb(player.id);
  
  // show the new client all the old clients
  for(var id in entities)
  {
    comm.emit(player.id, 'PLAYER_JOINED', entities[id]);
  }
  
  // save the generated player-object
  entities[player.id] = player;
  
  var bodyDef = new Box2D.Dynamics.b2BodyDef;
  var fixDef = new Box2D.Dynamics.b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.2;
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  bodyDef.userData = player.id;
  bodyDef.fixedRotation = true;

  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox((player.width / 2) / mpp, (player.height / 2) / mpp);
  bodyDef.position.x = player.x / mpp;
  bodyDef.position.y = player.y / mpp;
  var body = world.CreateBody(bodyDef);
  body.CreateFixture(fixDef);

  bodies[player.id] = body;
  
  
  // show the old clients the new client
  comm.broadcast('PLAYER_JOINED', player);
}

exports.onPlayerLeft = function (id)
{
  console.log("Player left: " + entities[id].name + ", " + id);
  delete entities[id];
  world.DestroyBody(bodies[id]);
  delete bodies[id];
  comm.broadcast('PLAYER_LEFT', { id: id });
}

exports.onPacket = function (id, type, data)
{
  if(type == "MOVE")
  {
    var player = entities[id];
    bodies[id].SetLinearVelocity(new Box2D.Common.Math.b2Vec2(data.x, data.y));
  }
  else if(type == "CHAT")
  {
    comm.broadcast('CHAT', { msg: data.msg, sender: id });
  }
}

function worldStep()
{
  world.Step(timeStep, 15, 15);
  
  var _bodies = {};
  
  for(var b in bodies)
  {
    var pos = bodies[b].GetPosition();
    
    _bodies[b] =
      {
        x : pos.x * mpp,
        y : pos.y * mpp
      };
    
    entities[b].x = _bodies[b].x;
    entities[b].y = _bodies[b].y;
  }
  
  comm.broadcast('PHYSICS', { bodies : _bodies });
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
