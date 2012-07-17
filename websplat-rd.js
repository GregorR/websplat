(function() {
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
