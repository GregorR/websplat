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
    var keyDown = false;

    function flip(player) {
        if ("ownGravity" in player) {
            delete player.ownGravity;
        } else {
            player.ownGravity = -WebSplat.conf.gravity;
        }
        WebSplat.conf.jumpSpeed = -WebSplat.conf.jumpSpeed; // just hope this never gets screwed up :)
    }

    // add upside-down sprites
    var sprites = []; // doing it this way to avoid ES5 stuff, just in case
    for (var sprite in WebSplat.conf.playerImageSets) {
        sprites.push(sprite);
    }
    for (var i = 0; i < sprites.length; i++) {
        var oldsprite = WebSplat.conf.playerImageSets[sprites[i]];
        var sprite = WebSplat.conf.playerImageSets["ud." + sprites[i]] = {};
        for (var prop in oldsprite) sprite[prop] = oldsprite[prop];
        sprite.bb = oldsprite.bb.slice(0);
        sprite.bb[2] = sprite.bb[3] - sprite.bb[2];
    }

    // make it use the upside-down sprites
    var oldUpdateImagePrime = WebSplat.Player.prototype.updateImagePrime;
    WebSplat.Player.prototype.updateImagePrime = function() {
        oldUpdateImagePrime.apply(this, arguments);

        if (this.dead && "ownGravity" in this) {
            // always die right-side-up
            flip(this);
        }

        if ("ownGravity" in this) this.state = "ud." + this.state;
    };

    WebSplat.Player.prototype.specialOn = function() {
        if (!keyDown) {
            keyDown = true;
            flip(this);
        }
    };

    WebSplat.Player.prototype.specialOff = function() {
        keyDown = false;
    };
})();
