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
    var diamondDogConf = {
        dogs: ["pp2."],
        moveSpeed: 3,
        pointsPerKill: 500,
        edgeDetectDist: 5,
        edgeDetectSize: 10 /* hopAbove*2 */
    }

    var diamondDogImageSets = {
        r: {
            frames: 16,
            frameRate: 3,
            width: 53,
            height: 53,
            bb: [23, 39, 31, 35]
        },
        c: {
            frames: 32,
            frameRate: 3,
            width: 82,
            height: 58,
            bb: [36, 68, 37, 40], // make this fit with r
        }
    }

    function DiamondDog() {
        this.mode = this.state = "r";
        WebSplat.Sprite.call(this,
            diamondDogConf.dogs[WebSplat.getRandomInt(0, diamondDogConf.dogs.length)],
            diamondDogImageSets, true, true);
        this.munching = false;
        this.xacc = 0;
        this.updateImage();
    }
    WebSplat.Pony = DiamondDog;
    DiamondDog.prototype = new WebSplat.SpriteChild();
    DiamondDog.prototype.isBaddy = true;

    DiamondDog.prototype.updateImagePrime = function() {
        if (this.state === "c" && this.frame >= diamondDogImageSets.c.frames) {
            this.state = "r";
            this.frame = 0;
        }
    }

    // don't collide with goodies
    DiamondDog.prototype.collision = function(els, xs, ys) {
        if (els === null) return els;
        var rels = [];
        for (var i = 0; i < els.length; i++) {
            if ("wpSprite" in els[i] && els[i].wpSprite.isGoody) {
                this.thru[els[i].wpID] = true;
            } else {
                rels.push(els[i]);
            }
        }
        if (rels.length === 0) return null;
        return rels;
    }

    // every tick, change the acceleration inexplicably
    DiamondDog.prototype.tick = function() {
        if (!this.onScreen()) return;

        if (this.dead) {
            // whoops!
            if (this.state == "da") {
                this.state = "db";
                this.frame = 0;
            } else if (this.state == "db") {
                this.state = "dc";
                this.frame = 0;
            } else if (this.state = "dc") {
                this.state = "dd";
                this.frame = 0;
            }
            this.updateImage();
            return;
        }

        // do a normal round
        WebSplat.Sprite.prototype.tick.call(this);
        if (WebSplat.player === this) return;

        // only do anything if we're on a platform
        if (!this.munching && this.on !== null) {
            // if we bumped into something left or there is nothing to the left ...
            if (this.leftOf !== null || this.noPlatform(this.x-diamondDogConf.edgeDetectDist-diamondDogConf.edgeDetectSize)) {
                this.xacc = 1;
                this.xaccmax = diamondDogConf.moveSpeed;
            } else if (this.rightOf !== null || this.noPlatform(this.x+this.w+diamondDogConf.edgeDetectDist)) {
                this.xacc = -1;
                this.xaccmax = -diamondDogConf.moveSpeed;
            } else if (this.xacc === false || this.xacc == 0) {
                this.xacc = 1;
                this.xaccmax = diamondDogConf.moveSpeed;
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
    DiamondDog.prototype.noPlatform = function(x) {
        var els = WebSplat.getElementsByBoxThru(this, this.thru, false, x, diamondDogConf.edgeDetectSize, this.y+this.h, diamondDogConf.edgeDetectSize);
        if (els === null) return true;
        return false;
    }

    // if we hit the bottom, go back to the top
    DiamondDog.prototype.hitBottom = function() {
        console.log("Bottom, moving to " + this.h*2);
        this.setXY(this.x, this.h*2);
    }

    // take damage
    DiamondDog.prototype.takeDamage = function(from, pts) {
        // make it dead
        this.dead = true;
        this.mode = "d";
        this.state = "da";
        this.frame = 0;
        this.updateImage();

        // points for the player
        if ("getPoints" in from) {
            from.getPoints(diamondDogConf.pointsPerKill);
        }

        // then remove it
        var spthis = this;
        WebSplat.deplatformSprite(spthis);
        setTimeout(function() {
            WebSplat.remSprite(spthis);
            spthis.el.style.display = "none";
        }, 5000);
    }

    // by default, stick some diamond dog in the game
    WebSplat.addHandler("postload", function() {
        var last = null;
        // create some diamond dogs!
        WebSplat.spritesOnPlatform(diamondDogImageSets.r.width, diamondDogImageSets.r.height,
            480, 480*320, function() { return (last = new DiamondDog()); });
        WebSplat.player = last;
        WebSplat.assertPlayerViewport();
    });
})();
