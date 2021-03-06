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
    if (!("pointsPerApple" in WebSplat.conf))
        WebSplat.conf.pointsPerApple = 100;

    var appleImageSets = {
        s: {
            frames: 1,
            frameRate: 3,
            width: 14,
            height: 16
        }
    }

    function Apple() {
        this.mode = this.state = "s";
        WebSplat.Sprite.call(this, "apple.", appleImageSets, true, true);
        this.xacc = 0;
        this.updateImage();
    }
    WebSplat.Sprite.prototype.isGoody = false;
    WebSplat.Sprite.prototype.isApple = false;
    Apple.prototype = new WebSplat.SpriteChild();
    Apple.prototype.isGoody = true;
    Apple.prototype.isApple = true;

    // Buy some apples!
    WebSplat.addHandler("postload", function() {
        WebSplat.spritesOnPlatform(appleImageSets.s.width, appleImageSets.s.height, 240, 320*240,
            function() { return new Apple(); });
    });

    // collisions with apples
    WebSplat.addHandler("oncollide", function(player, el, pj, xs, ys) {
        if (!("wpSprite" in el)) return;
        var apple = el.wpSprite;
        if (!apple.isApple) return;

        // collect the apple
        el.style.visibility = "hidden";
        WebSplat.remSprite(apple);
        player.getPoints(WebSplat.conf.pointsPerApple);
    });
})();
