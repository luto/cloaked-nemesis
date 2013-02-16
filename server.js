var app = require('http').createServer(handler)
  , static = require('node-static')
  , log4js = require('log4js');

log4js.replaceConsole();

console.info("starting http..");
app.listen(8080);
var file = new (static.Server)();

function handler (req, res)
{
  if(req.url == "/")
    req.url = "/index.html"
  file.serve(req, res);
}

console.info("starting game..");
var game = require('./game.js');
game.init(app);
