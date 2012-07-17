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
    var appletreeImageSets = {
        s: {
            frames: 1,
            frameRate: 3,
            width: 210,
            height: 300,
            bb: [40, 80, 20, 20]
        }
    }

    function AppleTree() {
        WebSplat.Sprite.call(this, "appletree.", appletreeImageSets, true, true);
        this.el.style.zIndex = ""+(this.el.style.zIndex-1);
        this.xacc = 0;
        this.updateImage();
    }
    WebSplat.Sprite.prototype.isTree = false;
    AppleTree.prototype = new WebSplat.SpriteChild();
    AppleTree.prototype.isGoody = true;
    AppleTree.prototype.isTree = true;

    var keyDown = false;
    WebSplat.Player.prototype.specialOn = function() {
        if (!keyDown) {
            keyDown = true;
            var b = new AppleTree();
            b.setXY(this.x, this.y - appletreeImageSets.s.height);
            WebSplat.addSprite(b);

            setTimeout(function() {
                WebSplat.remSprite(b);
                b.el.style.display = "none";
            }, 15000);
        }
    };
    WebSplat.Player.prototype.specialOff = function() {
        keyDown = false;
    };

    // collisions with apple trees
    var oldpcoll = WebSplat.Player.prototype.collision;
    WebSplat.Player.prototype.collision = function(els, xs, ys, hop) {
        // use the old one
        els = oldpcoll.apply(this, arguments);
        if (els === null) return els;

        // then get rid of trees
        if (ys <= 0 || hop) {
            for (var i = 0; i < els.length; i++) {
                if ("wpSprite" in els[i] && els[i].wpSprite.isTree) {
                    els.splice(i, 1);
                    i--;
                }
            }
        }

        if (els.length === 0) els = null;

        return els;
    };

    // passthru apple trees
    WebSplat.addHandler("onpassthru", function(player, el) {
        if ("wpSprite" in el && el.wpSprite.isTree) {
            if (player.yvel > 0) {
                player.xvel = 0;
                player.yvel = 0;
                if (player.on === null) player.on = [];
                player.on.push(el);

                // feh
                player.jump = 0;
                player.powerJump = false;
            }
        }
    });
})();
