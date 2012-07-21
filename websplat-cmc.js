/*
 * Copyright (c) 2010, 2012 Gregor Richards
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
    var rescuePoints = 1000;

    var cmcImageSets = {
        s: {
            frames: 49,
            frameRate: 2,
            width: 64,
            height: 36,
            bb: [11, 21, 11, 11]
        }
    }

    function CMC() {
        WebSplat.Sprite.call(this, "cmc.", cmcImageSets, true, true);
        this.xacc = 0;
        this.updateImage();
    }
    WebSplat.Sprite.prototype.isCMC = false;
    CMC.prototype = new WebSplat.SpriteChild();
    CMC.prototype.isGoody = true;
    CMC.prototype.isCMC = true;

    WebSplat.addHandler("postload", function() {
        WebSplat.player.hasCMC = false;

        var b = new CMC();
        var minY = Math.floor(WebSplat.conf.maxY * 0.75);
        var xy = WebSplat.randomPlatformPosition(cmcImageSets.s.width, cmcImageSets.s.height, minY);
        b.setXY(xy.x, xy.y);
        b.startingPosition();
        WebSplat.addSprite(b);
    });

    // collisions with cmcs
    WebSplat.addHandler("oncollide", function(player, el, pj, xs, ys) {
        if (!("wpSprite" in el)) return;
        var cmc = el.wpSprite;
        if (!cmc.isCMC) return;

        // You've got 'em!
        el.style.visibility = "hidden";
        WebSplat.remSprite(cmc);
        player.getPoints(rescuePoints);

        WebSplat.player.hasCMC = true;

        WebSplat.addHandler("ontick", function() {
            if (!WebSplat.player.hasCMC) return;
            var player = WebSplat.player;
            if (player.y < player.h*3) {
                // rescued 'em!
                WebSplat.player.hasCMC = false;
                player.getPoints(rescuePoints);

                var winimg = document.createElement("img");
                winimg.src = WebSplat.conf.imageBase + "youwin.png";
                winimg.style.position = "absolute";
                winimg.style.left = Math.floor(WebSplat.conf.maxX / 2 - 225) + "px";
                winimg.style.top = "15px";
                winimg.style.zIndex = ""+(player.el.style.zIndex - 10);
                document.body.appendChild(winimg);
            }
        });
    });
})();
