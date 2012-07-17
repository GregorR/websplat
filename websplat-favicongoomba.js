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
    var faviconConf = {
        moveSpeed: 1.5
    }

    var faviconImageSets = {
        s: {
            frames: 16,
            frameRate: 6,
            frameAliases: [
                0, 1, 2, 3, 4, 5, 6, 7,
                0, 7, 6, 5, 4, 3, 2, 1
            ],
            iconOffset: [ // these are the offsets in the /left/ image
                [5, 5], // 0
                [5, 4],
                [3, 5],
                [2, 5],
                [3, 5],
                [5, 4], // 5
                [6, 4],
                [6, 5]
            ],
            width: 25,
            height: 32
        }
    }

    WebSplat.Sprite.prototype.isBaddy = false;

    function Favicon() {
        // first, look for a link tag
        WebSplat.Sprite.call(this, "favicongoomba.php?domain=" + escape(document.domain) + "&frame=", faviconImageSets, true, true);
        this.munching = false;
        this.xacc = 0;
        this.yacc = 0;
        this.isBaddy = true;
        this.updateImage();
    }
    Favicon.prototype = new WebSplat.SpriteChild();

    // every tick, change the acceleration inexplicably
    Favicon.prototype.tick = function() {
        if (!this.onScreen()) return;

        // do a normal round
        WebSplat.Sprite.prototype.tick.call(this);

        // only do anything if we're on a platform
        if (!this.munching && this.on !== null) {
            // if we bumped into something left or there is nothing to the left ...
            if (this.leftOf !== null) {
                this.xacc = 1;
                this.xaccmax = faviconConf.moveSpeed;
            } else if (this.rightOf !== null) {
                this.xacc = -1;
                this.xaccmax = -faviconConf.moveSpeed;
            } else if (this.xacc === false || this.xacc == 0) {
                this.xacc = 1;
                this.xaccmax = faviconConf.moveSpeed;
            }
        } else {
            this.xacc = false;
        }

        if (this.y<0) {
            // don't let them go above the screen
            this.setXY(this.x, 0);
        }
    }

    // take damage
    Favicon.prototype.takeDamage = function(from, pts) {
        WebSplat.remSprite(this);
        this.el.style.display = "none";
    }

    // by default, stick a single favicon in the game
    WebSplat.addHandler("postload", function() {
        var minY = 240;
        var maxY = WebSplat.conf.maxY-minY;
        // create some favicons!
        var sdc = Math.ceil((WebSplat.conf.maxX*maxY)/(640*960));
        for (var i = 0; i < sdc; i++) {
            var b = new Favicon();
            b.setXY(Math.random()*WebSplat.conf.maxX, Math.random()*maxY+minY);
            b.startingPosition();
            WebSplat.addSprite(b);
        }
    });
})();
