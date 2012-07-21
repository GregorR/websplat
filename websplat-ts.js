/*
 * Copyright (c) 2012 Gregor Richards
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

(function() {
    var teleportImageSets = {
        s: {
            frames: 9,
            frameRate: 3,
            width: 140,
            height: 120,
            bb: [-4, -8, -4, -8]
        }
    };

    function Teleport() {
        WebSplat.Sprite.call(this, "tport.", teleportImageSets, false, false);
        this.xacc = 0;
        this.updateImage();
        this.el.style.visibility = "hidden";
        this.el.style.zIndex = ""+(this.el.style.zIndex-0+1);
    }
    Teleport.prototype = new WebSplat.SpriteChild();

    Teleport.prototype.tick = function() {
        this.updateImage();
        if (this.frame >= teleportImageSets.s.frames * teleportImageSets.s.frameRate) {
            // kill it
            WebSplat.remSprite(this);
            this.el.style.visibility = "hidden";
        }
    }

    // we need a "from" and "to" teleport image
    var fromTele = new Teleport();
    var toTele = new Teleport();

    function placeTeleport(tele, x, y) {
        WebSplat.remSprite(tele);
        tele.frame = 0;
        WebSplat.addSprite(tele);
        tele.setXY(x, y);
        tele.el.style.visibility = "visible";
    }

    var keyDown = false;

    WebSplat.Player.prototype.specialOn = function() {
        if (!keyDown) {
            keyDown = true;
            var to = [
                WebSplat.getRandomInt(0, WebSplat.conf.maxX),
                WebSplat.getRandomInt(0, this.y)
            ];

            // place the teleport sprites
            placeTeleport(fromTele, this.x - (this.w+this.xioff+10),
                                    this.y - (this.h+this.yioff+10));
            placeTeleport(toTele,   to[0] - (this.w+this.xioff+10),
                                    to[1] - (this.h+this.yioff+10));

            // then move
            this.setXY(to[0], to[1]);
            this.startingPosition();
        }
    };

    WebSplat.Player.prototype.specialOff = function() {
        keyDown = false;
    };
})();
