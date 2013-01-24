/*
 * Copyright (c) 2010, 2012-2013 Gregor Richards
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var WebSplat = new (function() {
    var wpthis = this;

    // configuration:
    var wpConf = this.conf = {
        // what level should we divide up the grid (as a power of 2)?
        gridDensity: 6,

        // how long is a tick?
        msPerTick: 30,

        gravity: 1,
        flyMax: -10,
        runAcc: 1.5, // acceleration while running (on normal ground)
        runSlowAcc: 1.5, // slowdown while trying to stop running
        jumpAcc: 1.5, // acceleration mid-jump (magic)
        jumpSlowAcc: 0, // slowdown while trying to stop mid-jump
        moveSpeed: 10,
        jumpSpeed: 15,
        crouchThru: 10,
        hopAbove: 5, // how many pixels we can jump up without actually jumping

        // frames to be zapped for
        zapTime: 10,

        // time to be invincible for
        invTime: 1000,

        imageBase: "http://websplat.bitbucket.org/imgs/",

        // auto-filled
        maxX: 0,
        maxY: 0
    };

    // handlers:
    var wpHandlers = this.handlers = {
        "preload": [],
        "postload": [],
        "onelement": [],
        "onplatform": [],
        "onnonplatform": [],
        "ontick": [],
        "oncollide": [],
        "onpassthru": [],
        "onpause": [],
        "onresume": []
    };

    function addHandler(type, func) {
        wpHandlers[type].push(func);
    }
    this.addHandler = addHandler;

    function callHandlers(type) {
        var harr = wpHandlers[type];
        var ret = true;
        for (var i = 0; i < harr.length; i++) {
            var func = harr[i];
            var fret = func.apply(this, arguments);
            if (typeof(fret) !== "undefined") {
                ret = ret && fret;
            }
        }
        return ret;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    this.getRandomInt = getRandomInt;

    // globals
    var maxX = 0;
    var maxY = 0;
    var curWPID = 0;

    // yield
    function yield(func) {
        setTimeout(func, 0);
    }
    
    // the hash of all element positions in buckets
    var elementPositions = {};
    
    // initialize element positions
    function initElementPositions(then) {
        var plats = [];
        initElementPlatforms(plats, [document.body], function() {
            // then add all the elements
            addElementPositions(plats, function() {
                if (maxX < $(window).width()-20) maxX = $(window).width()-20;
                wpConf.maxX = maxX;
                wpConf.maxY = maxY;

                // make a platform for the bottom
                var bspan = document.createElement("span");
                bspan.style.position = "absolute";
                bspan.style.left = "0px";
                bspan.style.top = (maxY + 100) + "px";
                bspan.style.width = maxX + "px";
                bspan.style.height = "10px";
                document.body.appendChild(bspan);
                addElementPositions([bspan], then);
            });
        });
    }

    function addElementPositions(plats, then) {
        var i = 0;
        function steps() {
            var end = i + 100;
            for (; i < plats.length && i < end; i++) {
                var el = plats[i];
                if (!("wpIsPlatform" in el)) {
                    el.wpIsPlatform = true;
                    addElementPosition(el);
                    callHandlers("onplatform", el);
                }
            }
            if (i == plats.length) {
                then();
            } else {
                yield(steps);
            }
        }
        steps();
    }

    // initialize platform elements
    function initElementPlatforms(plats, els, then) {
        var stTime = new Date().getTime();
        var whitespace = /^[ \r\n\t\u00A0]*$/;

        while (els.length) {
            if (new Date().getTime() - stTime >= 100) {
                // yield for now, do more later
                yield(function() {
                    initElementPlatforms(plats, els, then);
                });
                return;
            }

            // specific to this element
            var el = els.shift();
            var jqel = $(el);
            var eltag = el.tagName.toUpperCase();
            var hasText = false;
            var hasChildren = false;
            var isBoring = false;
            var isPlatform = true;
    
            if ("wpIgnore" in el) continue;
    
            callHandlers("onelement", el);

            /* if it's position:fixed, we don't want it at all (can't platform
             * on something that moves with the scrollbar) */
            if (jqel.css("position") === "fixed") continue;
        
            // recurse to sub-elements first
            var cns = el.childNodes;
            var cnsl = cns.length;
            for (var i = 0; i < cnsl; i++) {
                var cnode = cns[i];
                if (cnode.nodeType === 3) { // Node.TEXT_NODE
                    if (!whitespace.test(cnode.data)) // if it's just whitespace, ignore it
                        hasText = true;
                } else if (cnode.nodeType === 1) { // Node.ELEMENT_NODE
                    hasChildren = true;
                    els.push(cnode);
                }
            }
        
            /* there are certain types which we'll never want to handle, some
             * which we always want to handle, and some which are boring when
             * content-free */
            switch (eltag) {
                case "BODY":
                case "SCRIPT":
                case "NOSCRIPT":
                case "NOEMBED":
                case "OPTION":
                    isPlatform = false;
                    break;

                case "TEXTAREA":
                case "INPUT":
                    isPlatform = true;
                    el.wpSpan = true; // force it to be treated as the innermost
                    break;

                case "TD":
                case "BR":
                    isBoring = true;
                    break;
            }
        
            // if we don't have text and do have children, we don't want this node to be a platform or obstacle
            if (!hasText && (hasChildren || isBoring)) isPlatform = false;
        
            // if it's invisible, don't want it
            if (jqel.css("display") === "none" || jqel.css("visibility") === "hidden")
                isPlatform = false;

            // more complicated ways for it to be invisible
            if (!hasText && (eltag === "DIV" || eltag === "SPAN") &&
                (/(^$|rgba\((\d+, *){3}0\)|transparent)/.test(jqel.css("background-color")) &&
                 /^(|none)$/.test(jqel.css("background-image")) &&
                 /^($|0px)/.test(jqel.css("border-width")))) {
                // likely that this is just alignment BS
                isPlatform = false;
            }
  
            // if it's not a platform, we're done
            if (!isPlatform) {
                callHandlers("onnonplatform", el);
                continue;
            }

            var csposition = jqel.css("position");
            var csdisplay = jqel.css("display");
       
            // OK, definitely a platform, so block it right
            if (!("wpSpan" in el)) {
                // text align becomes weird
                var ta = jqel.css("textAlign");
                if (eltag === "CENTER") {
                    el.style.textAlign = "center";
                    ta = "center";
                }
                switch (ta) {
                    case "center":
                        el.style.margin = "auto";
                        break;

                    case "right":
                        el.style.marginLeft = "auto";
                        break;
                }

                if (hasText || hasChildren) {
                    /* need to put everything in spans and make /those/ the
                     * platform for us to stand on the right parts of text */

                    /* but before we do that, make sure we don't eff up its
                     * width by forcing its specified width to its computed
                     * width */
                    el.style.width = jqel.css("width");

                    // now recurse
                    var subels = [];
                    var spanel;
                    while (el.firstChild !== null) {
                        if (el.firstChild.nodeType === 3) { // Node.TEXT_NODE
                            var chi, chl = el.firstChild.data.length;
                            // make a span per character
                            for (chi = 0; chi < chl; chi++) {
                                var ch = el.firstChild.data[chi];
                                var chn = document.createTextNode(ch);
                                if (whitespace.test(ch)) {
                                    subels.push(chn);

                                } else {
                                    var spanel = document.createElement("span");
                                    spanel.wpSpan = true;
                                    spanel.style.display = "inline";
                                    spanel.style.visibility = "visible";
                                    spanel.style.width = "auto";
                                    spanel.appendChild(chn);
                                    subels.push(spanel);

                                }
                            }

                            el.removeChild(el.firstChild);

                        } else {
                            subels.push(el.removeChild(el.firstChild));

                        }
                    }

                    // then put those spans in this
                    for (var i = 0; i < subels.length; i++)
                        el.appendChild(subels[i]);

                    // and handle them instead
                    for (var i = 0; i < subels.length; i++) {
                        if (subels[i].nodeType === 1) { // Node.ELEMENT_NODE
                            els.push(subels[i]);
                        }
                    }

                } else {
                    el.style.visibility = "visible";
                    plats.push(el);
                }

            } else {
                // add its position to elementPositions
                el.style.visibility = "visible";
                plats.push(el);
            }
        }

        then();
    }
    
    // add an element at a position
    function addElementPosition(el) {
        el.wpID = curWPID++;

        var scrollTop = document.documentElement.scrollTop ||
            document.body.scrollTop;
        var scrollLeft = document.documentElement.scrollLeft ||
            document.body.scrollLeft;
        var rects = el.getClientRects();

        // save for later removal if necessary
        el.wpSavedScrollTop = scrollTop;
        el.wpSavedScrollLeft = scrollLeft;
        el.wpSavedRects = rects;

        var rectl = rects.length;
        for (var recti = 0; recti < rectl; recti++) {
            var rect = rects[recti];
            var ell = rect.left + scrollLeft;
            var elt = rect.top + scrollTop;
            var elr = rect.right + scrollLeft;
            var elb = rect.bottom + scrollTop;
            if (ell == elr || elt == elb) continue;

            if (elr > maxX) maxX = elr;
            if (elb > maxY) maxY = elb;

            // adjust the info
            ell = Math.floor(ell>>wpConf.gridDensity);
            elt = Math.floor(elt>>wpConf.gridDensity);
            elr = Math.ceil(elr>>wpConf.gridDensity);
            elb = Math.ceil(elb>>wpConf.gridDensity);
        
            // put it in the hash
            for (var y = elt; y <= elb; y++) {
                if (!(y in elementPositions)) {
                    elementPositions[y] = {};
                }
                var epy = elementPositions[y];
        
                for (var x = ell; x <= elr; x++) {
                    if (!(x in epy)) {
                        epy[x] = [];
                    }
                    epy[x].push(el);
                }
            }
        }
    }
    this.addElementPosition = addElementPosition;

    // remove this paltform
    function remElementPosition(el) {
        if (!("wpSavedRects" in el)) return;

        var scrollTop = el.wpSavedScrollTop;
        var scrollLeft = el.wpSavedScrollLeft;
        var rects = el.wpSavedRects;

        var rectl = rects.length;
        for (var recti = 0; recti < rectl; recti++) {
            var rect = rects[recti];
            var ell = rect.left + scrollLeft;
            var elt = rect.top + scrollTop;
            var elr = rect.right + scrollLeft;
            var elb = rect.bottom + scrollTop;
            if (ell == elr || elt == elb) continue;

            if (elr > maxX) maxX = elr;
            if (elb > maxY) maxY = elb;

            // adjust the info
            ell = Math.floor(ell>>wpConf.gridDensity);
            elt = Math.floor(elt>>wpConf.gridDensity);
            elr = Math.ceil(elr>>wpConf.gridDensity);
            elb = Math.ceil(elb>>wpConf.gridDensity);
        
            // take it from the hash
            for (var y = elt; y <= elb; y++) {
                if (!(y in elementPositions)) continue;
                var epy = elementPositions[y];
        
                for (var x = ell; x <= elr; x++) {
                    if (!(x in epy)) continue;
                    var els = epy[x];
                    var outels = [];

                    for (var i = 0; i < els.length; i++) {
                        if (els[i] !== el) outels.push(els[i]);
                    }

                    epy[x] = outels;
                }
            }
        }

        try {
            delete el.wpSavedScrollTop;
            delete el.wpSavedScrollLeft;
            delete el.wpSavedRects;
        } catch (ex) {}
    }
    this.remElementPosition = remElementPosition;

    // move this element to its new location
    function movElementPosition(el) {
        remElementPosition(el);
        addElementPosition(el);
    }
    this.movElementPosition = movElementPosition;

    // get elements by grid position
    function getElementsGridPosition(x, y) {
        var ely = elementPositions[y];
        if (typeof ely === "undefined") return null;
        var els = ely[x];
        if (typeof els === "undefined") return null;
        return els;
    }
    this.getElementsGridPosition = getElementsGridPosition;

    // is el within max of fromX, fromY?
    function elInDistance(el, max, fromX, fromY) {
        var scrollTop = el.wpSavedScrollTop;
        var scrollLeft = el.wpSavedScrollLeft;
        var rects = el.wpSavedRects;

        for (var ri = 0; ri < rects.length; ri++) {
            var rect = rects[ri];
            var ell = rect.left + scrollLeft;
            var elr = rect.right + scrollLeft;
            var elt = rect.top + scrollTop;
            var elb = rect.bottom + scrollTop;
            var cx, cy, dx, dy;

            if (ell < fromX) {
                if (elr < fromX) {
                    cx = elr;
                } else {
                    cx = fromX;
                }
            } else {
                cx = ell;
            }

            if (elt < fromY) {
                if (elb < fromY) {
                    cy = elb;
                } else {
                    cy = fromY;
                }
            } else {
                cy = elt;
            }

            dx = fromX - cx;
            if (dx < 0) dx = -dx;
            dy = fromY - cy;
            if (dy < 0) dy = -dy;

            if (dx > max || dy > max) continue;
            if (dx + dy <= max) return true;

            var rdist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            if (rdist <= max) return true;
        }

        return false;
    }
    this.elInDistance = elInDistance;

    // the sprite list
    var sprites = this.sprites = [];

    // add a sprite to the sprite list
    function addSprite(sprite) {
        sprites.push(sprite);
    }
    this.addSprite = addSprite;

    // deplatform a sprite
    function deplatformSprite(sprite) {
        if (sprite.isPlatform) {
            remElementPosition(sprite.el);
            sprite.isPlatform = false;
        }
    }
    this.deplatformSprite = deplatformSprite;

    // remove a sprite from the sprite list
    function remSprite(sprite) {
        // if it's a platform, remove that first
        deplatformSprite(sprite);

        // then remove it from the list
        var osprites = [];
        for (var i = 0; i < sprites.length; i++) {
            if (sprites[i] !== sprite) osprites.push(sprites[i]);
        }
        sprites = this.sprites = osprites;
    }
    this.remSprite = remSprite;

    // the main timer
    var gameTimer = null;

    // stuff for keeping framerate right
    var refTime = null;
    var nextTime = null;
    var tickNo = null;

    // perform a tick for every sprite
    function spritesTick() {
        var tries = 0;
        retry: while (true) {
            if (refTime === null) {
                refTime = new Date().getTime();
                tickNo = 1;
            } else {
                tickNo++;

                // see if we're too early
                while (new Date().getTime() < nextTime) {}
            }

            callHandlers("ontick", this);

            if (sprites.length == 0) {
                // time to stop!
                if (gameTimer !== null) {
                    clearTimeout(gameTimer);
                    gameTimer = refTime = null;
                }

            } else {
                // tick every sprite
                for (var i = 0; i < sprites.length; i++) {
                    sprites[i].tick();
                }

            }

            var cur = new Date().getTime();
            var next = nextTime = refTime + tickNo*wpConf.msPerTick;
            var ms = next - cur;

            if (ms < 0) {
                tries++;
                if (tries < 3) {
                    continue retry;
                } else {
                    if (ms < -250) refTime = null;
                    gameTimer = setTimeout(spritesTick, 0);
                }
            } else {
                gameTimer = setTimeout(spritesTick, ms);
            }

            break;
        }
    }

    // start the sprite timer
    function spritesGo() {
        gameTimer = setTimeout(spritesTick, wpConf.msPerTick);

        $(window).focus(function() {
            if (gameTimer === null) {
                callHandlers("onresume");
                gameTimer = setTimeout(spritesTick, wpConf.msPerTick);
            }
        });

        $(window).blur(function() {
            if (gameTimer !== null) {
                callHandlers("onpause");
                clearTimeout(gameTimer);
                gameTimer = refTime = null;
            }
        });
    }

    // the Sprite "class", which represents an object with accelerative movement and displayed as an image
    function Sprite(imageBase, imageSets, hasGravity, isPlatform) {
        this.imageBase = imageBase;
        this.imageSets = imageSets;
        this.hasGravity = hasGravity;
        this.isPlatform = isPlatform;

        // default to the mode and state "s"
        if (typeof(this.mode) === "undefined")
            this.mode = "s";
        if (typeof(this.state) === "undefined")
            this.state = "s";
        this.dir = "r";
        this.frame = 0;

        // useless default location and size
        this.x = 0;
        this.y = 0;
        this.xioff = 0;
        this.yioff = 0;
        try {
            this.w = imageSets["s"].width;
            this.h = imageSets["s"].height;
        } catch (ex) {
            this.w = 0;
            this.h = 0;
        }

        // useless default speed and acceleration
        this.xvel = 0;
        this.xacc = false; // false means "stop"
        this.xaccmax = false; // the maximum velocity we can get to by acceleration
        this.slowxacc = 1; // slowdown due to "friction"
        this.yvel = 0;
        this.yacc = false; // less meaningful here

        // are we being zapped?
        this.zap = false;

        // what elements are left of us?
        this.leftOf = null;

        // what elements are right of us?
        this.rightOf = null;

        // what elements are above us?
        this.above = null;

        // what elements are we standing on?
        this.on = null;
    
        // what elements are we clipping through?
        this.thru = {};

        // load all the images
        if (typeof(this.images) === "undefined") {
            var images = this.images = {};
            for (var state in imageSets) {
                var imgSet = imageSets[state];
                for (var dir in {"r":0,"l":0}) {
                    for (var i = 0; i < imgSet.frames; i++) {
                        if ("frameAliases" in imgSet && imgSet.frameAliases[i] != i) continue;
                        var img = new Image();
                        if (imageBase.match(/\/\//)) {
                            img.src = imageBase + state + i + dir + ".png";
                        } else {
                            img.src = wpConf.imageBase + imageBase + state + i + dir + ".png";
                        }
                        images[state + i + dir] = img;
                    }
                }
            }
        }

        // create the img element that is the actual display of the sprite
        this.el = document.createElement("canvas");
        this.useCanvas = true;
        if (!("getContext" in this.el)) {
            this.el = document.createElement("img");
            this.useCanvas = false;
        }
        this.el.wpSprite = this;
        this.el.style.padding = this.el.style.margin = "0px";

        this.drawn = null;
        this.draw(this.state, "r", 0);

        this.el.style.color = "black";
        this.el.style.position = "absolute";
        this.el.style.zIndex = "1000000";
        this.el.style.fontSize = "20px";
        document.body.appendChild(this.el);

        // if it's a sprite platform, we want a faster getClientRects than the builtin one
        if (isPlatform) {
            this.el.getClientRects = function() {
                var scrollTop = document.documentElement.scrollTop ||
                    document.body.scrollTop;
                var scrollLeft = document.documentElement.scrollLeft ||
                    document.body.scrollLeft;

                return [{
                    left: this.wpSprite.x - scrollLeft,
                    top: this.wpSprite.y - scrollTop,
                    right: this.wpSprite.x + this.wpSprite.w - scrollLeft,
                    bottom: this.wpSprite.y + this.wpSprite.h - scrollTop
                }];
            }
        }

        this.setXY(0, 0);
        this.updateImage();
    }
    this.Sprite = Sprite;
    function SpriteChild() {}
    this.SpriteChild = SpriteChild;
    SpriteChild.prototype = Sprite.prototype;

    // (private) draw an image
    Sprite.prototype.draw = function(state, dir, num) {
        var toDraw = state + num + dir;
        if (this.drawn === toDraw) return;

        var imgSet = this.imageSets[state];
        this.el.width = imgSet.width;
        this.el.height = imgSet.height;
        this.el.style.width = imgSet.width + "px";
        this.el.style.height = imgSet.height + "px";

        var img = this.images[toDraw];
        if (!("complete" in img) ||
            (img.complete && img.width > 0 && img.height > 0)) {
            this.el.style.border = "0px";
            if (this.useCanvas) {
                var ctx = this.el.getContext("2d");
                ctx.drawImage(img, 0, 0);
            } else {
                this.el.src = img.src;
            }
            this.drawn = toDraw;
        } else {
            this.el.style.border = "1px solid red";
            this.drawn = null;
        }
    }

    // usually part of tick, update the image
    Sprite.prototype.updateImage = function() {
        // image change
        this.frame++;
        if (this.frame > 1024) this.frame = 0;

        // choose our direction
        if (this.xvel > 0) {
            this.dir = "r";
        } else if (this.xvel < 0) {
            this.dir = "l";
        } else if (this.xacc > 0) {
            this.dir = "r";
        } else if (this.xacc < 0) {
            this.dir = "l";
        }

        this.updateImagePrime();

        // but forcibly be zapped if they say so
        if (this.zap !== false) {
            this.state = "z";
            this.zap--;
            if (this.zap <= 0) this.zap = false;
        }

        // get the image and frame
        var imgSet = this.imageSets[this.state];
        var frame = Math.floor(this.frame/imgSet.frameRate) % imgSet.frames;

        // frames can be aliased
        if ("frameAliases" in imgSet) {
            frame = imgSet.frameAliases[frame];
        }

        // and bounding boxes can be reduced
        var bb = [1, 2, 1, 2];
        if ("bb" in imgSet) {
            bb = imgSet.bb;
            if (this.dir == "l") {
                if ("bbl" in imgSet) {
                    bb = imgSet.bbl;
                } else {
                    bb = bb.slice(0);
                    bb[0] = bb[1] - bb[0];
                    imgSet.bbl = bb;
                }
            }
        }
        this.xioff = bb[0];
        this.yioff = bb[2];

        this.draw(this.state, this.dir, frame);

        // and check for width/height changes
        if (this.w != imgSet.width - bb[1]) {
            // adjust left by half the difference (or right for shrinking)
            this.x -= Math.floor((imgSet.width - bb[1] - this.w)/2);
        }
        if (this.h != imgSet.height - bb[3]) {
            // adjust up by the full difference
            this.y -= imgSet.height - bb[3] - this.h;
        }

        this.w = imgSet.width - bb[1];
        this.h = imgSet.height - bb[3];
    }

    // override this for sprites that actually change
    Sprite.prototype.updateImagePrime = function() {}

    // set the X and Y (usually used internally by tick)
    Sprite.prototype.setXY = function(x, y) {
        this.x = x;
        this.y = y;
    
        this.el.style.left = Math.floor(this.x-this.xioff) + "px";
        this.el.style.top = Math.floor(this.y-this.yioff) + "px";

        // make sure it remains a platform
        if (this.isPlatform) {
            movElementPosition(this.el);
            this.thru[this.el.wpID] = true;
        }
    }

    // perform a tick of this sprite
    Sprite.prototype.tick = function() {
        if (!this.onScreen()) return;

        this.updateImage();

        // get the acceleration from our platform
        var realxacc = this.xacc;
        if (this.xacc === false) realxacc = 0;
        var slowxacc = this.slowxacc;
        if (this.on === null) {
            realxacc *= wpConf.jumpAcc;
            slowxacc *= wpConf.jumpSlowAcc;
        } else {
            realxacc *= wpConf.runAcc;
            slowxacc *= wpConf.runSlowAcc;
        }
        var appgravity = this.hasGravity ? ("ownGravity" in this) ? this.ownGravity : wpConf.gravity : 0;
        var gravs = (appgravity >= 0) ? 1 : -1;
        var realyacc = appgravity;
        if (this.yacc !== false) realyacc += this.yacc;
 

        // acceleration
        var xas = (this.xacc >= 0) ? 1 : -1;
        this.yvel += realyacc;
        if (this.yacc !== false && this.yvel < wpConf.flyMax)
            this.yvel = wpConf.flyMax;
        if (this.xacc === false) {
            // slow down!
            if (this.xvel > 0) {
                this.xvel -= slowxacc;
                if (this.xvel < 0) this.xvel = 0;
            } else if (this.xvel < 0) {
                this.xvel += slowxacc;
                if (this.xvel > 0) this.xvel = 0;
            }
        } else if (this.xaccmax === false || this.xvel*xas < this.xaccmax*xas) {
            this.xvel += realxacc;
            if (this.xaccmax !== false && this.xvel*xas >= this.xaccmax*xas) {
                this.xvel = this.xaccmax;
            }
        }
  
        this.postAcc();
    

        // then velocity
        // signs we need
        var xs = (this.xvel >= 0) ? 1 : -1;
        var ys = (this.yvel >= 0) ? 1 : -1;

        // x first
        var x = this.x;
        var xe = x + this.xvel;
        this.rightOf = this.leftOf = null;
        for (; x*xs <= xe*xs; x += xs) {
            var els = wpGetElementsByBoxThru(this, this.thru, false, x, this.w, this.y, this.h-wpConf.hopAbove);
            if (els !== null) {
                els = this.collision(els, xs, 0);
                if (els === null) continue;

                if (xs >= 0) {
                    this.rightOf = els;
                } else {
                    this.leftOf = els;
                }

                this.xvel = x - this.x;
                break;
            }
        }
        if (x != this.x) x -= xs;
        if ("forcexvel" in this) {
            this.xvel = this.forcexvel;
            delete this.forcexvel;
        }

        // if we need to hop, do so
        while (x != this.x &&
            this.collision(
                wpGetElementsByBoxThru(this, this.thru, false, x, this.w, this.y+this.h-wpConf.hopAbove, wpConf.hopAbove),
                0, ys, true) !== null) {
            this.y--;
        }
    
        // then y
        var y = this.y;
        var ye = y + this.yvel;
        var leading = (ys>=0) ? this.h : 0;
        this.above = this.on = null; // default to not being on anything
        for (; y*ys <= ye*ys; y += ys) {
            var els = wpGetElementsByBoxThru(this, this.thru, false, x, this.w, y+leading, 0);
            if (els !== null) {
                els = this.collision(els, 0, ys);
                if (els === null) continue;

                // get more elements to drop through if we duck
                var morels = wpGetElementsByBoxThru(this, this.thru, false, x, this.w, y + this.crouchThru*ys, this.h);
                if (morels != null) els.push.apply(els, morels);

                // then fail
                if (ys*gravs >= 0) {
                    this.on = els;
                } else {
                    this.above = els;
                }
                this.yvel = y - this.y;
                break;
            }
        }
        if (y != this.y) y -= ys;
        if ("forceyvel" in this) {
            this.yvel = this.forceyvel;
            delete this.forceyvel;
        }

        // get our thrulist correct by getting around our location
        wpGetElementsByBoxThru(this, this.thru, true, x-1, this.w+2, y-1, this.h+2);

        // bounds
        if (x < 0) {
            if (this.leftOf === null) this.leftOf = [];
            x = 0;
        }
        if (x + this.w > maxX) {
            if (this.rightOf === null) this.rightOf = [];
            x = maxX - this.w;
        }
        if (y < -240) y = -240;
        if (y + this.h > maxY + 100) {
            if (this.on === null) this.on = [];
            y = maxY - this.h + 100;
            this.hitBottom();
        }

        // now set the location
        this.setXY(x, y);
    }

    // override if you need it
    Sprite.prototype.postAcc = function() {}
    Sprite.prototype.collision = function(els, xs, ys) {return els;}
    Sprite.prototype.hitBottom = function() {}
    Sprite.prototype.takeDamage = function(from, pts) {return false;} // returns true if killed
    Sprite.prototype.doDamage = function(to, pts) {}

    // make this a starting position by figuring out what we're clipping through
    Sprite.prototype.startingPosition = function() {
        var thru = {};
        var gothru = wpGetElementsByBox(this.x, this.w, this.y, this.h);
        if (gothru !== null) {
            for (var i = 0; i < gothru.length; i++) {
                thru[gothru[i].wpID] = true;
            }
        }
        this.thru = thru;
    }

    // is this sprite onscreen?
    Sprite.prototype.onScreen = function() {
        var scrollTop = document.documentElement.scrollTop ||
            document.body.scrollTop;
        if (this.y+this.h >= scrollTop &&
            this.y <= scrollTop+$(window).height())
            return true;
        return false;
    }


    // do these two boxes intersect?
    function boxIntersection(l1, r1, t1, b1, l2, r2, t2, b2) {
        var xInt = r1 >= l2 && l1 <= r2;
        var yInt = b1 >= t2 && t1 <= b2;
        return xInt && yInt;
    }

    // get any element at this location
    function wpGetElementsByBox(l, w, t, h) {
        // get the bins
        var ls = Math.floor(l>>wpConf.gridDensity);
        var r = l+w;
        var rs = Math.floor(r>>wpConf.gridDensity);
        var ts = Math.floor(t>>wpConf.gridDensity);
        var b = t+h;
        var bs = Math.floor(b>>wpConf.gridDensity);
    
        var els = [];
        var checked = {};
   
        for (var ys = ts; ys <= bs; ys++) {
            for (var xs = ls; xs <= rs; xs++) {
                // get the values
                var epy = elementPositions[ys];
                if (typeof(epy) === "undefined") continue;
    
                var elbox = epy[xs];
                if (typeof(elbox) === "undefined") continue;
    
                // now check for an actual overlap
                for (var eli = 0; eli < elbox.length; eli++) {
                    var el = elbox[eli];
                    if (el.wpID in checked) continue;
                    checked[el.wpID] = true;
                    if (typeof(el.wpAllowClip) !== "undefined") continue;

                    // check each rect
                    var scrollLeft = el.wpSavedScrollLeft;
                    var scrollTop = el.wpSavedScrollTop;
                    var rects = el.wpSavedRects;
                    var rectl = rects.length;
                    for (var recti = 0; recti < rectl; recti++) {
                        var rect = rects[recti];
                        var ell = rect.left + scrollLeft;
                        var elt = rect.top + scrollTop;
                        var elr = rect.right + scrollLeft;
                        var elb = rect.bottom + scrollTop;
    
                        if (boxIntersection(l, r, t, b, ell, elr, elt, elb)) {
                            els.push(el);
                        }
                    }
                }
            }
        }
    
        if (els.length == 0) return null;
        return els;
    }
    this.getElementsByBox = wpGetElementsByBox;

    // get any element at this location we're not currently falling through
    function wpGetElementsByBoxThru(sprite, thru, upd, l, w, t, h) {
        var inels = wpGetElementsByBox(l, w, t, h);
        var outels = [];
        var outthru = {};
    
        if (inels === null) inels = [];
    
        // first get rid of anything we're going through now
        for (var i = 0; i < inels.length; i++) {
            var inel = inels[i];
            outthru[inel.wpID] = true;
            if (inel.wpID in thru) {
                callHandlers("onpassthru", sprite, inel);
            } else {
                outels.push(inel);
            }
        }
    
        // then remove from the thru list anything we've already gone through
        if (upd) {
            for (var tid in thru) {
                if (!(tid in outthru)) {
                    delete thru[tid];
                }
            }
        }
    
        if (outels.length == 0) return null;
        return outels;
    }
    this.getElementsByBoxThru = wpGetElementsByBoxThru;

    // get a random platform
    function randomPlatform(minY, tries) {
        if (typeof minY === "undefined") minY = 0;
        if (typeof tries === "undefined") tries = 128;
        for (var i = 0; i < tries; i++) {
            var ybox = getRandomInt(minY>>wpConf.gridDensity, (wpConf.maxY>>wpConf.gridDensity)+1);
            if (!(ybox in elementPositions)) continue;
            var epy = elementPositions[ybox];
            var xbox = getRandomInt(0, (wpConf.maxX>>wpConf.gridDensity)+1);
            if (!(xbox in epy)) continue;
            var els = epy[xbox];
            if (els.length === 0) continue;
            var el = els[getRandomInt(0, els.length)];
            if (minY > 0 &&
                el.wpSavedRects[0].top + el.wpSavedScrollTop < minY) continue;
            return el;
        }
        return null;
    }
    this.randomPlatform = randomPlatform;

    // get a position over a random platform
    function randomPlatformPosition(w, h, minY, tries) {
        var platform = randomPlatform(minY, tries);
        if (platform === null) {
            // well, we tried!
            console.log("Fail");
            return {x: getRandomInt(0, wpConf.maxX), y: getRandomInt(minY, wpConf.maxY)};
        }

        var scrollLeft = platform.wpSavedScrollLeft;
        var scrollTop = platform.wpSavedScrollTop;
        var rects = platform.wpSavedRects;
        var rectl = rects.length;
        var topRect = rects[0];

        // find the top one
        for (var recti = 1; recti < rectl; recti++)
            if (rects[recti].top < topRect.top) topRect = rects[recti];

        var ell = topRect.left + scrollLeft;
        var elr = topRect.right + scrollLeft;
        var elt = topRect.top + scrollTop;

        // now choose our position
        return {
            x: getRandomInt(ell, elr - w),
            y: elt - h - 2
        };
    }
    this.randomPlatformPosition = randomPlatformPosition;

    // autoposition this kind of sprite on platforms
    function spritesOnPlatform(w, h, minY, frequencyR, cons, tries) {
        var maxY = wpConf.maxY - minY;
        var count = Math.ceil((wpConf.maxX*maxY)/frequencyR);
        for (var i = 0; i < count; i++) {
            var b = cons();
            var xy = randomPlatformPosition(w, h, minY, tries);
            b.setXY(xy.x, xy.y);
            b.startingPosition();
            addSprite(b);
        }
    }
    this.spritesOnPlatform = spritesOnPlatform;

    var viewportAsserted = false;
    function assertViewport(left, right, top, bottom) {
        // should we scroll?
        var mustScroll = false;
    
        // get the viewport location
        var vx = $(document).scrollLeft();
        var vy = $(document).scrollTop();
        var vw = $(window).width();
        var vr = vx + vw;
        var vh = $(window).height();
        var vb = vy + vh;
    
        // check if we're in bounds
        if (right < vw - 200) {
            if (vx > 0) {
                mustScroll = true;
                vx = 0;
            }
        } else {
            var nvx = right - vw + 200;
            if (nvx + vw > maxX) nvx = maxX - vw;
            if (nvx < 0) nvx = 0;
            if (vx != nvx) {
                mustScroll = true;
                vx = nvx;
            }
        }
        if (top < vy + 200) {
            mustScroll = true;
            vy = top - 200;
        }
        if (bottom > vb - 200) {
            mustScroll = true;
            vy = bottom - vh + 200;
        }
    
        // set it
        if (mustScroll) {
            viewportAsserted = false;
            window.scroll(Math.floor(vx), Math.floor(vy));
            viewportAsserted = true;
        }
    }

    function assertPlayerViewport() {
        assertViewport(wpthis.player.x, wpthis.player.x+wpthis.player.w,
                       wpthis.player.y, wpthis.player.y+wpthis.player.h);
    }
    this.assertPlayerViewport = assertPlayerViewport;

    // and if they try to scroll themselves, take it back!
    $(window).scroll(function() {
        if (viewportAsserted && "player" in wpthis && wpthis.player !== null)
            assertPlayerViewport();
    });

    function go() {
        callHandlers("preload");

        // before anything else, make sure the body is static positioned, as it will break things otherwise
        document.body.style.position = "static";
    
        initElementPositions(function() {
            /*
            // prevent resizing (it's cheating!)
            var origW = $(window).width();
            var origH = $(window).height();
            $(window).resize(function(event) {
                if ($(window).width() == origW && $(window).height() == origH) {
                    // spurious
                    return;
                }

                // no resizing!
                player.dead = true;
            });

            // put the player in the starting position
            player.setXY(Math.floor($(window).width()/2), player.h*2);
            player.startingPosition();
            */

            // finish loading
            callHandlers("postload");
            wpDisplayMessage();

            // and go
            spritesGo();
        });
    };
    this.go = go;
})();
