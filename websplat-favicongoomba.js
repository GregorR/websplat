/*
 * Copyright (c) 2010, 2012 Gregor Richards
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
        WebSplat.Sprite.call(this, "http://codu.org/websplat/favicongoomba.php?domain=" + escape(document.domain) + "&frame=", faviconImageSets, true, true);
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
