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

(function() {
    var bazRad = 100;
    var bazPower = 50;
    var bazPowerupTime = 2000;
    var bazSpeed = 30;
    var gd = WebSplat.conf.gridDensity;

    var bazPowerMult = bazPower/bazRad;

    var rocketLauncherImageSets = {
        r: {
            frames: 1,
            frameRate: 3,
            width: 62,
            height: 62,
            bb: [26, 45, 35, 39]
        }
    };

    function Rocket(firedBy) {
        this.mode = this.state = "r";
        this.expended = false;
        this.firedBy = firedBy;
        WebSplat.Sprite.call(this, "pp2.", rocketLauncherImageSets, true, false);
        this.slowxacc = 0;
    }
    Rocket.prototype = new WebSplat.SpriteChild();

    // FIXME: why is this necessary?
    Rocket.prototype.tick = function() {
        this.thru[this.firedBy.el.wpID] = true;
        WebSplat.Sprite.prototype.tick.call(this);
    }

    Rocket.prototype.collision = function(els, xs, ys) {
        var bazX = this.x;
        var bazY = this.y;

        // only for REAL collisions, thank you
        if (els === null) return els;

        // only blow up once
        if (this.expended) return els;
        this.expended = true;

        for (var i = 0; i < els.length; i++) {
            if (els[i].wpSprite === WebSplat.player)
                console.log("DAMMIT");
        }

        // destroy the rocket
        WebSplat.deplatformSprite(this);
        WebSplat.remSprite(this);
        this.el.parentNode.removeChild(this.el);

        // find all the platforms in this region and destroy them
        var minX = bazX - bazRad;
        var maxX = bazX + bazRad;
        var minY = bazY - bazRad;
        var maxY = bazY + bazRad;

        var minXB = minX >> gd;
        var maxXB = maxX >> gd;
        var minYB = minY >> gd;
        var maxYB = maxY >> gd;

        // now loop, looking for elements in range
        for (var y = minYB; y <= maxYB; y++) {
            for (var x = minXB; x <= maxXB; x++) {
                var els = WebSplat.getElementsGridPosition(x, y);
                if (els === null) continue;
                for (var i = 0; i < els.length; i++) {
                    var el = els[i];
                    if ("wpSprite" in el) {
                        // give it momentum
                        var sprite = el.wpSprite;
                        var dx = sprite.x - bazX;
                        var dy = sprite.y - bazY;
                        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                        if (dist < bazRad) {
                            var angle = Math.atan2(Math.abs(dy), Math.abs(dx));
                            sprite.xvel = Math.cos(angle) * (bazRad - dist) * bazPowerMult * ((dx>0)?1:-1);
                            sprite.forceyvel = Math.sin(angle) * (bazRad - dist) * bazPowerMult * ((dy>0)?1:-1);
                        }
                    } else if (WebSplat.elInDistance(el, bazRad, bazX, bazY)) {
                        WebSplat.remElementPosition(el);
                        el.style.visibility = "hidden";
                    }
                }
            }
        }

        return els;
    }

    var mdStart = null;

    $(window).mousedown(function(ev) {
        mdStart = new Date().getTime();
        ev.preventDefault();
        ev.stopPropagation();
    });

    $(window).mouseup(function(ev) {
        if (WebSplat.player === null) return true;
        var player = WebSplat.player;

        if (mdStart === null) return true;

        // how long have we been holding it down?
        var bazTime = new Date().getTime() - mdStart;
        mdStart = null;
        bazTime /= bazPowerupTime;
        if (bazTime > 1.0) bazTime = 1.0;
        bazTime = bazTime * 0.75 + 0.25;

        ev.preventDefault();
        ev.stopPropagation();

        // figure out the angle that the rocket should be fired at
        var angle = Math.atan2(ev.pageY - player.y, ev.pageX - player.x);
        var xvel = Math.cos(angle) * bazSpeed * bazTime;
        var yvel = Math.sin(angle) * bazSpeed * bazTime;

        var rocket = new Rocket(player);
        rocket.setXY(player.x + xvel, player.y + yvel);
        rocket.startingPosition();
        rocket.xvel = xvel;
        rocket.yvel = yvel;
        WebSplat.addSprite(rocket);

        return false;
    });

    $(window).click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    });
})();
