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
    WebSplat.Sprite.prototype.isGoody = false;

    WebSplat.player = null; // no current player

    WebSplat.addHandler("postload", function() {
        var keydown = function(ev) {
            if (ev.ctrlKey || ev.altKey || ev.metaKey) return true;
            if (WebSplat.player === null) return true;
            var player = WebSplat.player;
            switch (ev.which) {
                case 37: // left
                case 65: // a
                    player.xacc = -1;
                    player.xaccmax = WebSplat.conf.moveSpeed * -1;
                    break;
        
                case 39: // right
                case 68: // d
                    player.xacc = 1;
                    player.xaccmax = WebSplat.conf.moveSpeed;
                    break;
        
                case 38: // up
                case 87: // w
                    if ("pressingUp" in player) break;
                    player.pressingUp = true;
                    if (player.on !== null) {
                        player.jump++;
                        player.on = null;
                        player.yvel = -WebSplat.conf.jumpSpeed;
                    } else if (player.jump <= 1) {
                        player.jump = 2;
                        player.powerJump = true;
                        player.yvel = -WebSplat.conf.jumpSpeed;
                    }
                    break;
        
                case 40: // down
                case 83: // s
                    if (player.on !== null) {
                        player.mode = "jfc";
                        player.frame = 0;
                        for (var i = 0; i < player.on.length; i++) {
                            player.thru[player.on[i].wpID] = true;
                        }
                        player.on = null;
                    }
                    break;

                case 70: // f
                case 32: // space
                    player.specialOn();
                    break;
            }
        
            ev.stopPropagation();
            return false;
        }
        $(document.body).keydown(keydown);
        $(window).keydown(keydown);
        
        var keyup = function(ev) {
            if (WebSplat.player === null) return true;
            var player = WebSplat.player;
            switch (ev.which) {
                case 37: // left
                case 65: // a
                    if (player.xacc < 0) {
                        player.xacc = false;
                        player.xaccmax = false;
                    }
                    break;
        
                case 39: // right
                case 68: // d
                    if (player.xacc > 0) {
                        player.xacc = false;
                        player.xaccmax = false;
                    }
                    break;
        
                case 38: // up
                case 87: // w
                    delete player.pressingUp;
                    break;
        
                case 40: // down
                case 83: // s
                    break;

                case 70: // f
                case 32: // space
                    player.specialOff();
                    break;
            }
        
            ev.stopPropagation();
            return false;
        }
        $(document.body).keyup(keyup);
        $(window).keyup(keyup);
    });

})();
