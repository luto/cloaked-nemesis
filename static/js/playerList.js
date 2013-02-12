var players$;

exports.init = function ()
{
  players$ = $('#players');
}

exports.setPos = function (left, top)
{
  $('#playerlist').css('top', top);
  $('#playerlist').css('left', left);
}

exports.addPlayer = function (name, color, score)
{
  var id = 'playerlist_entry_' + name;

  var html = $('<div class="playerlist_entry" id="' + id + '">' +
                 '<div class="playerlist_color"></div>' +
                 '<span class="playerlist_name"></span>' +
                 ' (<span class="playerlist_score"></span>)' +
               '</div>');

  players$.append(html);

  $('#' + id + ' .playerlist_name').text(name);
  $('#' + id + ' .playerlist_color').css('background-color', color);
  exports.setScoreOfPlayer(name, score);
}

exports.removePlayer = function (name)
{
  $('#playerlist_entry_' + name).remove();
}

exports.killPlayer = function (name)
{
  $('#playerlist_entry_' + name + ' .playerlist_name').css("text-decoration", "line-through");
}

exports.spawnPlayer = function (name)
{
  $('#playerlist_entry_' + name + ' .playerlist_name').css("text-decoration", "");
}

exports.setScoreOfPlayer = function (name, score)
{
  $('#playerlist_entry_' + name + ' .playerlist_score').text(score);
}
