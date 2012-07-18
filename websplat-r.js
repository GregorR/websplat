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
    var gemSpeed = 20;
    var gemJumpSpeed = 30;
    var gemSpeedH = Math.floor(Math.sqrt(gemSpeed*4));

    var gemImageSets = {
        a: {
            frames: 1,
            frameRate: 3,
            width: 14,
            height: 18,
            bb: [-4, -8, -4, -8]
        }
    };
    for (var i = 1; i < 6; i++) {
        gemImageSets[String.fromCharCode(97+i)] = gemImageSets.a;
    }

    function Gem() {
        this.mode = "d";
        this.state = "a";
        WebSplat.Sprite.call(this, "gem.", gemImageSets, true, true);
        this.xacc = 0;
        this.updateImage();
        this.el.style.visility = "hidden";
        this.el.style.zIndex = ""+(this.el.style.zIndex-0+1);
    }
    Gem.prototype = new WebSplat.SpriteChild();

    Gem.prototype.reset = function() {
        this.mode = "a";
        this.state = String.fromCharCode(97+WebSplat.getRandomInt(0, 6));
        this.life = Math.floor(3000 / WebSplat.conf.msPerTick);
    };

    Gem.prototype.collision = function(els, xs, ys) {
        if (els === null) return els;

        var rels = [];
        for (var i = 0; i < els.length; i++) {
            if ("wpSprite" in els[i]) {
                // don't interact with non-sprites
                if (els[i].wpSprite.isBaddy) {
                    rels.push(els[i]);
                    els[i].wpSprite.takeDamage(this, 1);
                }
            }
        }

        if (rels.length === 0) return null;
        return rels;
    };

    var gptick = Gem.prototype.tick;
    Gem.prototype.tick = function() {
        gptick.apply(this, arguments);

        this.life--;
        if (this.life <= 0 || !this.onScreen()) {
            this.mode = "d";
            WebSplat.remSprite(this);
            this.el.style.visibility = "hidden";
        }
    };

    // we need eight, one for each direction
    var gems = [
        new Gem(), new Gem(), new Gem(), new Gem(), new Gem(), new Gem(),
        new Gem(), new Gem()
    ];

    function placeGem(tele, x, y, xv, yv) {
        WebSplat.remSprite(tele);
        tele.frame = 0;
        WebSplat.addSprite(tele);
        tele.setXY(x, y);
        tele.forcexvel = xv;
        tele.forceyvel = yv;
        tele.el.style.visibility = "visible";
    }

    var keyDown = false;

    WebSplat.Player.prototype.specialOn = function() {
        if (!keyDown) {
            keyDown = true;
            //if (gems[0].mode === "a") return; // timeout!

            var loc = [this.x - (this.w-20), this.y - (this.h+this.yioff)];

            // place the gem sprites
            for (var i = 0; i < 8; i++) gems[i].reset();
            placeGem(gems[0], loc[0], loc[1],          0,  -gemSpeed);
            placeGem(gems[1], loc[0], loc[1],  gemSpeedH, -gemSpeedH);
            placeGem(gems[2], loc[0], loc[1],   gemSpeed,          0);
            placeGem(gems[3], loc[0], loc[1],  gemSpeedH,  gemSpeedH);
            placeGem(gems[4], loc[0], loc[1],          0,   gemSpeed);
            placeGem(gems[5], loc[0], loc[1], -gemSpeedH,  gemSpeedH);
            placeGem(gems[6], loc[0], loc[1],  -gemSpeed,          0);
            placeGem(gems[7], loc[0], loc[1], -gemSpeedH, -gemSpeedH);

            // then move
            if (!this.powerJump) {
                this.yvel = -WebSplat.conf.gravity*2;
                this.forceyvel = -gemJumpSpeed;
                this.jump = 1;
            }
        }
    };

    WebSplat.Player.prototype.specialOff = function() {
        keyDown = false;
    };
})();
