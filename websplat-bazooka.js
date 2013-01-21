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
    var gd = WebSplat.conf.gridDensity;

    var bazPowerMult = bazPower/bazRad;

    $(window).click(function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        // find all the platforms in this region and destroy them
        var bazX = ev.pageX;
        var bazY = ev.pageY;
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
                            console.log(Math.cos(angle));
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

        return false;
    });
})();
