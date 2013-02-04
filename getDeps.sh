#!/bin/sh

npm install socket.io
npm install node-static
npm install box2d

cd static/js/

wget "http://jindo.dev.naver.com/collie/download.php?name=collie.min" -O collie.min.js
wget "http://code.jquery.com/jquery-1.9.0.min.js" -O jquery-1.9.0.min.js
