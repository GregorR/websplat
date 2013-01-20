(function() {
    var bazRad = 100;
    var gd = WebSplat.conf.gridDensity;

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
                    if ("wpSprite" in el) continue;
                    if (WebSplat.elInDistance(el, bazRad, bazX, bazY)) {
                        WebSplat.remElementPosition(el);
                        el.style.visibility = "hidden";
                    }
                }
            }
        }

        return false;
    });
})();
