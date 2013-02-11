var messages$;
var msgCounter;

exports.init = function ()
{
  messages$ = $('#messages');
  msgCounter = 0;
}

exports.addMessage = function (msg)
{
  var id = msgCounter;

  var html = $('<p class="message" id="msg' + id + '"></p>');
  html.text(msg);
  messages$.append(html);

  setTimeout(function () { removeMessage(id) }, 1500);

  msgCounter++;
}

exports.playerJoined = function (nickname)
{
  exports.addMessage('Player joined: ' + nickname);
}

exports.playerLeft = function (nickname, reason)
{
  exports.addMessage('Player left: ' + nickname);
}

function removeMessage(id)
{
  var msg$ = $('#msg' + id);
  msg$.fadeOut(1500, function() { msg$.remove(); });
}
