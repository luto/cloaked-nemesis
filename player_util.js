exports.getPlayerIndex = function(players, id)
{
  for(var i = 0; i < players.length; i++)
  {
    if(players[i].id == id)
      return i;
  }
}

exports.getPlayerById = function(players, id)
{
  return players[exports.getPlayerIndex(players, id)];
}

exports.removePlayerById = function(players, id)
{
  removeAt(players, exports.getPlayerIndex(players, id));
}

// Array Remove - By John Resig (MIT Licensed)
function removeAt(arr, from, to) {
  var rest = arr.slice((to || from) + 1 || arr.length);
  arr.length = from < 0 ? arr.length + from : from;
  return arr.push.apply(arr, rest);
};

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