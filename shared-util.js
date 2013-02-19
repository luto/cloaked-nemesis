var RGBColor = require('./rgbcolor.js').RGBColor;

exports.nameRegex = /^[a-zA-ZüäöÜÄÖß]{1,10}$/;
exports.backColor = '#FFA6C9';
objBackColor = new RGBColor(exports.backColor);
objWhiteColor = new RGBColor("FFF");

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

exports.checkColor = function (color)
{
  var back = compareColor(new RGBColor(color), objBackColor);
  var white = compareColor(new RGBColor(color), objWhiteColor);

  if(back < 10)
    return false;
  if(white < 30)
    return false;
  else
    return true;
}

compareColor = function (c1, c2)
{
  var r = Math.abs(c1.r - c2.r);
  var g = Math.abs(c1.g - c2.g);
  var b = Math.abs(c1.b - c2.b);
  return Math.max(r, g, b);
}
