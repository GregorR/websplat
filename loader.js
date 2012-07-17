/*
 * Copyright (C) 2010 Gregor Richards
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function() {
    var gameNames = ["imagecollect"];
    var games = {"imagecollect": "Image collection"};
    var head;

    // debugging output
    var wpMsgOut = window.wpMsgOut = document.createElement("div");
    wpMsgOut.style.position = "fixed";
    wpMsgOut.style.left = "0px";
    wpMsgOut.style.top = "0px";
    wpMsgOut.style.width = "100%";
    wpMsgOut.style.zIndex = "1000000";
    wpMsgOut.style.visibility = "hidden";
    wpMsgOut.style.backgroundColor = "white";
    wpMsgOut.style.color = "black";
    wpMsgOut.style.textAlign = "center";
    wpMsgOut.style.borderBottom = "1px solid black";
    wpMsgOut.wpIgnore = true;
    document.body.appendChild(wpMsgOut);

    function displayMessage(str) {
        if (typeof(str) === "undefined") str = "";
        if (typeof(str) === "string") {
            if (str === "") {
                wpMsgOut.style.visibility = "hidden";
            } else {
                wpMsgOut.style.visibility = "visible";
            }
            wpMsgOut.innerHTML = str;
        } else {
            wpMsgOut.style.visibility = "visible";
            wpMsgOut.innerHTML = "";
            wpMsgOut.appendChild(str);
        }
    }
    window.wpDisplayMessage = displayMessage;

    function scriptChain(srcs) {
        srcs = srcs.slice(0);
        var src = srcs.shift();

        var script = document.createElement("script");
        if (src.match(/\//) {
            script.src = src;
        } else {
            script.src = "http://websplat.bitbucket.org/websplat/" + src;
        }
        head.appendChild(script);

        if (srcs.length > 0) {
            var loaded = false;
            script.onload = function() {
                if (!loaded) {
                    loaded = true;
                    scriptChain(srcs);
                }
            };
            script.onreadystatechange = function() {
                if (this.readyState === "loaded" ||
                    this.readyState === "complete") {
                    this.onload();
                }
            };
        }
    }

    // make a frame to offer selections in
    var selector = document.createElement("div");
    selector.style.color = "black";
    selector.style.textAlign = "center";
    selector.style.borderBottom = "1px solid black";
    selector.style.paddingBottom = "1em";
    displayMessage(selector);

    // a header to say what's going on
    var hdr = document.createElement("div");
    hdr.innerHTML = "Which game would you like to play?";
    selector.appendChild(hdr);

    // then offer the selections!
    for (var i = 0; i < gameNames.length; i++) {
        var game = gameNames[i];
        var gameDisp = games[game];

        var but = document.createElement("button");
        but.innerHTML = gameDisp;
        but.onclick = function() {
            head = document.getElementsByTagName("head")[0];
            selector.style.display = "none";

            displayMessage("Loading...");
            scriptChain([
                "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js",
                "websplat.js",
                "websplat-skulldog.js",
                "websplat-favicongoomba.js",
                "websplat-stats.js",
                "websplat-" + game + ".js",
                "go.js"
            ]);
        }
        selector.appendChild(but);
        if (i == 0) but.focus();
    }
})();
