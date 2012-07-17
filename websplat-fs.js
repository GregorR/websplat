(function() {
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
})();
