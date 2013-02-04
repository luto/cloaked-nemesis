var app = require('http').createServer(handler)
  , static = require('node-static');

app.listen(8080);
var file = new (static.Server)();

function handler (req, res)
{
  if(req.url == "/")
    req.url = "/index.html"
  file.serve(req, res);
}

var game = require('./game.js');
game.init(app);
