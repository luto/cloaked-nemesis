var comm = require('./communication.js');
var types = require('./types.js');
var sutil = require('./shared-util.js');;
require('./Box2dWeb-2.1.a.3.js');

// entities
var nextId = 0;
var entities = {};

// box2d
var world = null;
var tickInterval;
var fps = 120.0;
var timeStep = 1 / fps;
var bodies = {};

var mpp = 64;
var worldSize = { width: 333 / mpp, height: 333 / mpp }
var maxWorldSize = { width: 800 / mpp, height: 800 / mpp }
var worldCenter = { x: worldSize.width / 2, y: worldSize.height / 2 }

exports.init = function (app)
{
  console.info("creating box2d-world..");
  Box2D.Common.b2Settings.b2_velocityThreshold = 0;
  world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 0), false);
  tickInterval = setInterval(worldStep, 1000 / fps);

  comm.init(app, this);
}

exports.onNewConnection = function (socket)
{
  socket.emit('HELLO',
    {
      step: 0,
      worldSize:
        {
          width: worldSize.width * mpp,
          height: worldSize.height * mpp
        },
      maxWorldSize:
        {
          width: maxWorldSize.width * mpp,
          height: maxWorldSize.height * mpp
        }
    });
}

exports.onNewPlayer = function (data, cb)
{
  if(!data.name.match(sutil.nameRegex))
  {
    cb(null, "nickname-invalid");
    return;
  }

  if(!data.color.match(/^#[a-zA-Z0-9]{6}$/))
  {
    cb(null, "color-invalid");
    return;
  }

  if(!data.uid.match(/^[a-f0-9]{8}\-[a-f0-9]{4}\-4[a-f0-9]{3}\-[a-f0-9]{4}\-[a-f0-9]{12}$/))
  {
    cb(null, "uid-invalid");
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
      if(entities[id].uid == data.uid)
      {
        cb(null, "user-doubled");
        return;
      }
    }
  }

  player = new types.t_Player(nextId);
  player.x = worldCenter.x * mpp - player.width / 2;
  player.y = worldCenter.y * mpp - player.height / 2;
  player.color = data.color;
  player.name = data.name;
  player.uid = data.uid;
  
  nextId++;
  
  console.info("Player joined: name=" + player.name  +
                               " id=" + player.id    +
                            " color=" + player.color +
                              " uid=" + player.uid);
  
  // tell the socket its ID
  cb(player.id, null);
  
  // show the new client all the old clients
  for(var id in entities)
  {
    comm.onAddEntity(entities[id], player.id);
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
  console.info("Player left: name=" + entities[id].name + " id=" + id);
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
  var player = entities[id];
  if(sutil.checkChatMsg(player.lastChatMsg, message))
  {
    player.lastChatMsg = +new Date();
    comm.onChat(id, message);
  }
}

function worldStep()
{
  world.Step(timeStep, 15, 15);
  
  var _bodies = {};
  
  for(var b in bodies)
  {
    if(entities[b] instanceof types.t_Player)
    {
      checkPlayer(b);
    }

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

function checkPlayer(id)
{
  var player = entities[id];
  var body = bodies[id];

  if(player.alive)
  {
    var pos = body.GetPosition();

    if(pos.x + 0.5 > worldSize.width ||
       pos.x < -0.3 ||
       pos.y + 0.5 > worldSize.height ||
       pos.y < -0.3)
    {
      setPosition(id, worldSize.width * mpp, worldSize.height * mpp);
      player.alive = false;
      player.respawnTimer = 300;
      body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
      console.info("Player died: name=" + player.name + " id=" + id);
      comm.broadcast('DIE_ENTITY', { id: id });
    }
  }
  else
  {
    player.respawnTimer--;
    if(player.respawnTimer == 0)
    {
      setPosition(id, worldCenter.x * mpp - entities[id].width / 2,
                      worldCenter.x * mpp - entities[id].width / 2);
      body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
      player.alive = true;
      player.score--;
      console.info("Player respawned: name=" + entities[id].name + " id=" + id);
      comm.broadcast('RESPAWN_ENTITY', { id: id });
    }
  }
}

function setPosition(id, x, y)
{
  bodies[id].SetPosition(new Box2D.Common.Math.b2Vec2(x / mpp, y / mpp));
  entities[id].x = x;
  entities[id].y = y;
}
