WebSplat
========

WebSplat is a browser-based jump-n-run platformer game that works on any web
page. It converts the existing page into platforms, then adds its own sprites
and other game elements.

The best way to try WebSplat is probably the canonical WebSplat game at
http://websplat.bitbucket.org/ . If you want to make your own game or otherwise
make modifications, here's how:

1. Check out the source and data. The data is not stored in the source
   repository, it is available elsewhere.

2. Edit loader.js and websplat.js to refer to http://localhost:8080/ (or whever
   you will be hosting this) instead of http://websplat.bitbucket.org/websplat/ .

3. Start a web server to refer to it. http://code.google.com/p/mongoose/ is an
   easy choice.

4. Use the following bookmarklet:

        javascript:(function(s){s=document.createElement('script');s.src='http://localhost:8080/loader.js';document.getElementsByTagName('head')[0].appendChild(s);})()

When you have it working, it should be easy enough to figure out how to modify
loader.js, websplat.js and the bookmarklet to refer to your new instance.
