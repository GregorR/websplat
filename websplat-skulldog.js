/*
 * Copyright (c) 2010 Gregor Richards
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
    var skulldogConf = {
        moveSpeed: 3,
        edgeDetectDist: 5,
        edgeDetectSize: 10 /* hopAbove*2 */
    }

    var skulldogImageSets = {
        r: {
            frames: 2,
            frameRate: 3,
            width: 26,
            height: 22
        },
        d: {
            frames: 1,
            frameRate: 3,
            width: 30,
            height: 14
        }
    }

    WebSplat.Sprite.prototype.isBaddy = false;

    function Skulldog() {
        this.mode = this.state = "r";
        WebSplat.Sprite.call(this, "skulldog-", skulldogImageSets, true, true);
        this.munching = false;
        this.xacc = 0;
        this.yacc = 0;
        this.isBaddy = true;
        this.updateImage();
    }
    Skulldog.prototype = new WebSplat.SpriteChild();

    // every tick, change the acceleration inexplicably
    Skulldog.prototype.tick = function() {
        if (!this.onScreen()) return;

        // do a normal round
        WebSplat.Sprite.prototype.tick.call(this);

        // only do anything if we're on a platform
        if (!this.munching && this.on !== null) {
            // if we bumped into something left or there is nothing to the left ...
            if (this.leftOf !== null || this.noPlatform(this.x-skulldogConf.edgeDetectDist-skulldogConf.edgeDetectSize)) {
                this.xacc = 1;
                this.xaccmax = skulldogConf.moveSpeed;
            } else if (this.rightOf !== null || this.noPlatform(this.x+this.w+skulldogConf.edgeDetectDist)) {
                this.xacc = -1;
                this.xaccmax = -skulldogConf.moveSpeed;
            } else if (this.xacc === false || this.xacc == 0) {
                this.xacc = 1;
                this.xaccmax = skulldogConf.moveSpeed;
            }
        } else {
            this.xacc = false;
        }

        if (this.y<0) {
            // don't let them go above the screen
            this.setXY(this.x, 0);
        }
    }

    // is their no platform at this X?
    Skulldog.prototype.noPlatform = function(x) {
        var els = WebSplat.getElementsByBoxThru(this, this.thru, false, x, skulldogConf.edgeDetectSize, this.y+this.h, skulldogConf.edgeDetectSize);
        if (els === null) return true;
        return false;
    }

    // take damage
    Skulldog.prototype.takeDamage = function(from, pts) {
        // make it dead
        this.mode = this.state = "d";
        this.updateImage();
        this.setXY(this.x, this.y);

        // then remove it
        WebSplat.remSprite(this);
        var spthis = this;
        setTimeout(function() {
            spthis.el.style.display = "none";
        }, 5000);
    }

    // by default, stick a single skulldog in the game
    WebSplat.addHandler("postload", function() {
        var minY = 240;
        var maxY = WebSplat.conf.maxY-minY;
        // create some skulldogs!
        var sdc = Math.ceil((WebSplat.conf.maxX*maxY)/(640*960));
        for (var i = 0; i < sdc; i++) {
            var b = new Skulldog();
            b.setXY(Math.random()*WebSplat.conf.maxX, Math.random()*maxY+minY);
            b.startingPosition();
            WebSplat.addSprite(b);
        }
    });

    // collisions with baddies
    WebSplat.addHandler("oncollide", function(player, el, pj, xs, ys) {
        if (!("wpSprite" in el)) return;
        var sprite = el.wpSprite;
        if (!sprite.isBaddy) return;
        if (player.dead) return;

        // OK, this is a player-baddy collision!
        if (ys > 0) {
            // not only that, it's a stomp!
            player.doDamage(sprite, 1);
            player.forceyvel = -10;
            sprite.takeDamage(player, 1);
        } else {
            // muahahahaha, KILL, KILL!!!
            if (player.takeDamage(sprite, 1)) {
                sprite.xacc = false;
                sprite.munching = true;
                player.deathSpeed = 2;
            } else {
                // get out of the way
                if (sprite.x < player.x) {
                    sprite.x = player.x - sprite.w - 1;
                } else {
                    sprite.x = player.x + player.w + 1;
                }
                sprite.startingPosition();
            }
            player.thru[sprite.el.wpID] = true;
        }
    });
})();
