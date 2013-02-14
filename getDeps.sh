#!/bin/sh

npm install socket.io
npm install node-static

rm Box2dWeb-2.1.a.3.js
wget "https://box2dweb.googlecode.com/files/Box2dWeb-2.1a.3.zip" -O Box2dWeb-2.1a.3.zip
unzip Box2dWeb-2.1a.3.zip Box2dWeb-2.1.a.3.js
rm Box2dWeb-2.1a.3.zip

alias sed='sed -i'
if [ ${OSTYPE//[0-9.]/} == 'darwin' ]; then
	alias sed="sed -i ''"
fi

sed "s/var Box2D = {};/Box2D = {};/" Box2dWeb-2.1.a.3.js

cd static/js/

wget "http://jindo.dev.naver.com/collie/download.php?name=collie.min" -O collie.min.js
wget "http://code.jquery.com/jquery-1.9.0.min.js" -O jquery-1.9.0.min.js
wget "https://raw.github.com/mattsnider/jquery-plugin-query-parser/master/jquery-queryParser.min.js" -O jquery-queryParser.min.js
wget "https://raw.github.com/claviska/jquery-miniColors/master/jquery.minicolors.js" -O jquery.minicolors.js
cd ../..

cd static/img
wget "https://raw.github.com/claviska/jquery-miniColors/master/jquery.minicolors.png" -O jquery.minicolors.png
cd ../..

cd static/css
wget "https://raw.github.com/claviska/jquery-miniColors/master/jquery.minicolors.css" -O jquery.minicolors.css
sed "s/jquery.minicolors.png/\/static\/img\/jquery.minicolors.png/" jquery.minicolors.css
cd ../..
