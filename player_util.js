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