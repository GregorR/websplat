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
    var breakSpeed = 20;

    WebSplat.conf.playerImageSets.f = {
        frames: 4,
        frameRate: 3,
        width: 68,
        height: 62,
        bb: [30, 46, 24, 36]
    };

    WebSplat.Player.prototype.specialOn = function() {
        if (this.yacc === false) {
            this.yacc = -WebSplat.conf.gravity*2;
            this.mode = "fly";
            this.frame = 0;
        }
    };

    WebSplat.Player.prototype.specialOff = function() {
        this.yacc = false;
    };

    WebSplat.addHandler("oncollide", function(player, el, pj, xs, ys) {
        if ("wpSprite" in el) return;

        // if we're going fast enough, we break things
        if (ys === 1 && xs === 0 && player.yvel > breakSpeed) {
            el.style.visibility = "hidden";
            WebSplat.remElementPosition(el);
        }
    });
})();
