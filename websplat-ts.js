(function() {
    var keyDown = false;

    WebSplat.Player.prototype.specialOn = function() {
        if (!keyDown) {
            keyDown = true;
            this.setXY(
                WebSplat.getRandomInt(0, WebSplat.conf.maxX),
                WebSplat.getRandomInt(0, WebSplat.conf.maxY - 240)
            );
        }
    };

    WebSplat.Player.prototype.specialOff = function() {
        keyDown = false;
    };
})();
