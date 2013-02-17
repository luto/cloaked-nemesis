exports.nameRegex = /^[a-zA-ZüäöÜÄÖß]{1,10}$/;
exports.backColor = '#FFA6C9';

exports.checkChatMsg = function (lastChatMsg, msg)
{
  if(lastChatMsg)
  {
    var now = +new Date();
    var diff = (now - lastChatMsg);
    diff = new Date(diff);
    if(diff.getSeconds() < 3 && diff.getMinutes() == 0)
      return false;
  }
  
  if(msg.length == 0)
    return false;

  return true;
}
