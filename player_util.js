exports.getCollisions = function(players, obj1, move)
{
  obj1.x += move.x;
  obj1.y += move.y;

  objs = [];

  for(var id in players)
  {
    if(players[id] == obj1)
      continue;

    var obj2 = players[id];

    if(checkCollide(obj1, obj2))
    {
      objs.push(obj2);
    }
  }
  
  obj1.x -= move.x;
  obj1.y -= move.y;
  
  return objs;
}

function checkCollide(obj1, obj2)
{
    return (obj1.x < obj2.x + obj2.width  && obj1.x + obj1.width  > obj2.x) &&
           (obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y);
}
