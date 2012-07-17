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
    if (!("pointsPerHealth" in WebSplat.conf)) {
        WebSplat.conf.pointsPerHealth = 200;
        WebSplat.conf.hpPerHealth = 1;
    }

    var healthImageSets = {
        s: {
            frames: 1,
            frameRate: 3,
            width: 22,
            height: 18,
            bb: [-4, -8, -4, -8]
        }
    }

    function Health() {
        this.mode = this.state = "s";
        WebSplat.Sprite.call(this, "health.", healthImageSets, true, true);
        this.xacc = 0;
        this.updateImage();
    }
    WebSplat.Sprite.prototype.isHealth = false;
    Health.prototype = new WebSplat.SpriteChild();
    Health.prototype.isGoody = true;
    Health.prototype.isHealth = true;

    // Spread some health around
    WebSplat.addHandler("postload", function() {
        var minY = 240;
        var maxY = WebSplat.conf.maxY-minY;
        var ac = Math.ceil((WebSplat.conf.maxX*maxY)/(800*600));
        for (var i = 0; i < ac; i++) {
            var b = new Health();
            b.setXY(Math.random()*WebSplat.conf.maxX, Math.random()*maxY+minY);
            b.startingPosition();
            WebSplat.addSprite(b);
        }
    });

    // collisions with healths
    WebSplat.addHandler("oncollide", function(player, el, pj, xs, ys) {
        if (!("wpSprite" in el)) return;
        var health = el.wpSprite;
        if (!health.isHealth) return;

        // collect the health
        el.style.visibility = "hidden";
        WebSplat.remSprite(health);
        player.getPoints(WebSplat.conf.pointsPerHealth);
        player.getHP(WebSplat.conf.hpPerHealth);
        player.updateStats();
    });
})();
