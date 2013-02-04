var comm = require('./communication.js');
var util = require('./player_util.js')
var types = require('./types.js');
var box2d = require('box2d');

var worldSize = { width: 500, height: 500 }

// entities
var nextId = 0;
var entities = {};

// box2d
var world = null;
var tickInterval;
var fps = 30.0;
var timeStep = 1 / fps;
var bodies = {};


exports.init = function (app)
{
  comm.init(app, this);
  box2d.b2Settings.b2_velocityThreshold = 0;
  var worldAABB = new box2d.b2AABB();
  worldAABB.lowerBound.Set(-25, -25);
  worldAABB.upperBound.Set(worldSize.width, worldSize.height);
  world = new box2d.b2World(worldAABB, new box2d.b2Vec2(0, 0), false);
  
  // top
  var groundBodyDef = new box2d.b2BodyDef();
  groundBodyDef.position.Set(worldSize.width / 2, -25);
  var groundBody = world.CreateBody(groundBodyDef);
  var groundShapeDef = new box2d.b2PolygonDef();
  groundShapeDef.SetAsBox(worldSize.width / 2 - 1, 0.001);
  groundBody.CreateShape(groundShapeDef);

  // bottom
  var groundBodyDef = new box2d.b2BodyDef();
  groundBodyDef.position.Set(worldSize.width / 2, worldSize.height - 25);
  var groundBody = world.CreateBody(groundBodyDef);
  var groundShapeDef = new box2d.b2PolygonDef();
  groundShapeDef.SetAsBox(worldSize.width / 2 - 1, 0.001);
  groundBody.CreateShape(groundShapeDef);

  // left
  var groundBodyDef = new box2d.b2BodyDef();
  groundBodyDef.position.Set(-25, worldSize.height / 2);
  var groundBody = world.CreateBody(groundBodyDef);
  var groundShapeDef = new box2d.b2PolygonDef();
  groundShapeDef.SetAsBox(0.001, worldSize.height / 2 - 1);
  groundBody.CreateShape(groundShapeDef);

  // right
  var groundBodyDef = new box2d.b2BodyDef();
  groundBodyDef.position.Set(worldSize.width - 25, worldSize.height / 2);
  var groundBody = world.CreateBody(groundBodyDef);
  var groundShapeDef = new box2d.b2PolygonDef();
  groundShapeDef.SetAsBox(0.001, worldSize.height / 2 - 1);
  groundBody.CreateShape(groundShapeDef);

  tickInterval = setInterval(worldStep, 50);
}

exports.onNewPlayer = function (data, cb)
{
  player = new types.t_Player(nextId);
  player.x = 100;
  player.y = 10;
  player.color = get_random_color();
  player.name = data.name;
  player.health = 100;
  
  nextId++;
  
  console.log("Player joined: " + player.name + ", " + player.id);
  
  // tell the socket its ID
  cb(player.id);
  
  comm.emit(player.id, 'HELLO', { id: player.id, worldSize: worldSize });
  
  // show the new client all the old clients
  for(var id in entities)
  {
    comm.emit(player.id, 'PLAYER_JOINED', entities[id]);
  }
  
  // save the generated player-object
  entities[player.id] = player;
  
  
  var bodyDef = new box2d.b2BodyDef();
  bodyDef.position.Set(player.x, player.y);
  bodyDef.userData = player.id;
  bodyDef.fixedRotation = true 
  
  var body = world.CreateBody(bodyDef);
  
  var shape = new box2d.b2PolygonDef();
  shape.SetAsBox(player.height / 2, player.width / 2);
  shape.density = 1;
  shape.friction = 0.01;
  
  body.CreateShape(shape);
  body.SetMassFromShapes();
  
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
    bodies[id].SetLinearVelocity(new box2d.b2Vec2(data.x, data.y));
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
        x : pos.x,
        y : pos.y
      };
    
    entities[b].x = pos.x;
    entities[b].y = pos.y;
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
