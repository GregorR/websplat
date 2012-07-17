/*
 * Copyright (C) 2010 Gregor Richards
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies. THE
 * SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
 * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

var WebSplatPony = "aj";

(function() {
    var ponyIDs = ["ts", "rd", "aj", "pp", "r", "fs"];
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
        if (src.match(/\/\//)) {
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
    selector.style.backgroundColor = "#aaaaaa";
    selector.style.color = "black";
    selector.style.textAlign = "center";
    selector.style.borderBottom = "1px solid black";
    selector.style.paddingBottom = "1em";
    displayMessage(selector);

    // a header to say what's going on
    var hdr = document.createElement("div");
    hdr.innerHTML = "Choose your hero!<br/>";
    selector.appendChild(hdr);

    // then offer the selections!
    for (var i = 0; i < ponyIDs.length; i++) {
        var pony = ponyIDs[i];
        var dir = (i >= ponyIDs.length / 2) ? "l" : "r";

        var but = document.createElement("img");
        but.src = "http://websplat.bitbucket.org/imgs/" + pony + ".s0" + dir + ".png";
        but.onclick = (function(pony) { return function() {
            WebSplatPony = pony;
            head = document.getElementsByTagName("head")[0];
            selector.style.display = "none";

            displayMessage("Loading...");
            scriptChain([
                "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js",
                "websplat.js",
                "websplat-stats.js",
                "websplat-imagecollect.js",
                "go.js"
            ]);
        }; })(pony);
        selector.appendChild(but);
    }
})();
