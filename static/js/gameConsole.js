var log$;
var msgCounter;
var maxMessages;

exports.init = function ()
{
  log$ = $('#log');
  msgCounter = 0;
  maxMessages = 10;
}

exports.addMessage = function (msg)
{
  var id = msgCounter;

  var html = $('<p class="message" id="msg' + id + '"></p>');
  html.text(msg);
  log$.append(html);

  if(log$.children().length > maxMessages)
  {
    removeMessage(log$.children().slice(0, log$.children().length - maxMessages));
  }
  
  setTimeout(function () { removeMessage(html) }, 30000);
  msgCounter++;
}

exports.playerJoined = function (nickname)
{
  exports.addMessage('Player joined: ' + nickname);
}

exports.playerLeft = function (nickname)
{
  exports.addMessage('Player left: ' + nickname);
}

exports.playerDied = function (nickname)
{
  exports.addMessage('Player died: ' + nickname);
}

exports.chatMessage = function (nickname, message)
{
  exports.addMessage(nickname + ': ' + message);
}

exports.setPos = function (left, top)
{
  $('#messages').css('top', top);
  $('#messages').css('left', left);
}

function removeMessage(msg$)
{
  msg$.fadeOut(1500, function() { msg$.remove(); });
}
