var comm = require('./communication.js');
var types = require('./types.js');
require('./Box2dWeb-2.1.a.3.js');

// entities
var nextId = 0;
var entities = {};

// box2d
var world = null;
var tickInterval;
var fps = 30.0;
var timeStep = 1 / fps;
var bodies = {};

var mpp = 64;
var worldSize = { width: 500 / mpp, height: 500 / mpp }
var worldCenter = { x: worldSize.width / 2, y: worldSize.height / 2 }
var battleFieldSize = { x: worldCenter.x - worldSize.width / 3,
                        y: worldCenter.y - worldSize.height / 3,
                        width: worldSize.width / 1.5,
                        height: worldSize.height / 1.5 }

exports.init = function (app)
{
  comm.init(app, this);
  Box2D.Common.b2Settings.b2_velocityThreshold = 0;
  world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 0), false);

  tickInterval = setInterval(worldStep, 1000 / fps);
}

exports.onNewConnection = function (socket)
{
  socket.emit('HELLO', { step: 0,
                         worldSize: { width: worldSize.width * mpp, height: worldSize.height * mpp },
                         battleFieldSize: { x: battleFieldSize.x * mpp, y: battleFieldSize.y * mpp,
                                        width: battleFieldSize.width * mpp, height: battleFieldSize.height * mpp } });
}

exports.onNewPlayer = function (data, cb)
{
  if(!data.name.match(/^[a-zA-ZüäöÜÄÖß]+$/) || data.name.length > 10)
  {
    cb(null, "nickname-invalid");
    return;
  }

  if(!data.color.match(/^#[a-zA-Z0-9]{6}$/))
  {
    cb(null, "color-invalid");
    return;
  }

  for(var id in entities)
  {
    if(entities[id] instanceof types.t_Player)
    {
      if(entities[id].name == data.name)
      {
        cb(null, "nickname-doubled");
        return;
      }
    }
  }

  player = new types.t_Player(nextId);
  player.x = worldCenter.x * mpp - player.width / 2;
  player.y = worldCenter.y * mpp - player.height / 2;
  player.color = data.color;
  player.name = data.name;
  
  nextId++;
  
  console.log("Player joined: " + player.name + ", " + player.id);
  
  // tell the socket its ID
  cb(player.id, null);
  
  // show the new client all the old clients
  for(var id in entities)
  {
    comm.emit(player.id, 'ADD_ENTITY', { entity: entities[id] });
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
  comm.onAddEntity(player);
}

exports.onPlayerLeft = function (id)
{
  console.log("Player left: " + entities[id].name + ", " + id);
  delete entities[id];
  world.DestroyBody(bodies[id]);
  delete bodies[id];
  comm.onRemoveEntity(id);
}

exports.onMove = function (id, direction)
{
  var player = entities[id];
  
  if(!player.alive)
    return;

  var vec = new Box2D.Common.Math.b2Vec2(0, 0);
  var len = 3;
  switch(direction)
  {
    case "up":
      vec.y = len * -1;
      break;
    case "down":
      vec.y = len;
      break;
    case "left":
      vec.x = len * -1;
      break;
    case "right":
      vec.x = len;
      break;
  }
  bodies[id].SetLinearVelocity(vec);
}

exports.onChat = function (id, message)
{
  comm.onChat(id, message);
}

function worldStep()
{
  world.Step(timeStep, 15, 15);
  checkPlayers();
  
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
  
  comm.onPhysics(_bodies);
}

function checkPlayers()
{
  for(var id in bodies)
  {
    if(entities[id] instanceof types.t_Player && entities[id].alive)
    {
      var pos = bodies[id].GetPosition();
      if(pos.x + 50 / mpp > battleFieldSize.x + battleFieldSize.width ||
         pos.x < battleFieldSize.x ||
         pos.y + 50 / mpp > battleFieldSize.y + battleFieldSize.height ||
         pos.y < battleFieldSize.y)
      {
        setPosition(id, worldSize.width * mpp - 50, 5);
        bodies[id].SetLinearVelocity(new Box2D.Common.Math.b2Vec2(-2, 0));
        entities[id].alive = false;
        comm.broadcast('DIE_ENTITY', { id: id });
      }
    }
    else if(entities[id] instanceof types.t_Player && !entities[id].alive)
    {
      var pos = bodies[id].GetPosition();
      if(pos.x <= 0)
      {
        setPosition(id, worldCenter.x * mpp - entities[id].width / 2,
                        worldCenter.x * mpp - entities[id].width / 2);
        bodies[id].SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
        entities[id].alive = true;
        entities[id].score--;
        comm.broadcast('RESPAWN_ENTITY', { id: id });
      }
    }
  }
}

function setPosition(id, x, y)
{
  bodies[id].SetPosition(new Box2D.Common.Math.b2Vec2(x / mpp, y / mpp));
  entities[id].x = x;
  entities[id].y = y;
}
