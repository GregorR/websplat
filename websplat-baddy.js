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
    WebSplat.Sprite.prototype.isBaddy = false;

    // collisions with baddies
    WebSplat.addHandler("oncollide", function(ev, player, el, pj, xs, ys) {
        if (!("wpSprite" in el)) return;
        var sprite = el.wpSprite;
        if (!sprite.isBaddy) return;
        if (sprite.dead || player.dead) return;

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
