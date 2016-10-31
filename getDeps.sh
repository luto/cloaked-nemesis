#!/bin/sh

alias sed='sed -i'
if [ ${OSTYPE//[0-9.]/} == 'darwin' ]; then
        alias sed="sed -i ''"
fi

# server libs
npm install socket.io
npm install node-static
npm install log4js

# Box2dweb
wget "https://raw.githubusercontent.com/hecht-software/box2dweb/v2.1a.4/Box2D.js" -O Box2dWeb-2.1.a.4.js
sed "s/var Box2D = {};/Box2D = {};/" Box2dWeb-2.1.a.4.js

# rgbcolor.js
wget "http://www.phpied.com/files/rgbcolor/rgbcolor.js" -O rgbcolor.js
sed "s/function RGBColor(color_string)/exports.RGBColor = function (color_string)/" rgbcolor.js

# client libs
cd static

mkdir js
cd js
wget "http://jindo.dev.naver.com/collie/download.php?name=collie.min" -O collie.min.js
wget "http://code.jquery.com/jquery-1.9.0.min.js" -O jquery-1.9.0.min.js
wget "https://raw.github.com/mattsnider/jquery-plugin-query-parser/master/jquery-queryParser.min.js" -O jquery-queryParser.min.js
wget "https://raw.github.com/claviska/jquery-miniColors/master/jquery.minicolors.js" -O jquery.minicolors.js
wget "https://raw.githubusercontent.com/carhartl/jquery-cookie/master/src/jquery.cookie.js" -O jquery.cookie.js
cd ..

mkdir img
cd img
wget "https://raw.github.com/claviska/jquery-miniColors/master/jquery.minicolors.png" -O jquery.minicolors.png
cd ..

mkdir css
cd css
wget "https://raw.github.com/claviska/jquery-miniColors/master/jquery.minicolors.css" -O jquery.minicolors.css
sed "s/jquery.minicolors.png/\/static\/img\/jquery.minicolors.png/" jquery.minicolors.css
cd ..
