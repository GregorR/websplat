/*
 * Copyright (c) 2010 Gregor Richards
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
    // images are "coins" (mainly just to avoid name-conflicts with actual images)
    WebSplat.coins = 0;

    // we have a game timer, just for giggles
    var gameTimer = null;
    var gameTime = 0;
    var pauseTimer = null;
    var pauseTime = 0;
    var won = false;

    // we need our borders to be important
    var coinStyle = document.createElement("style");
    try {
        coinStyle.innerHTML = ".wpCoinBorder { border: 2px solid gold !important; };";
    } catch (ex) {}
    document.getElementsByTagName("head")[0].appendChild(coinStyle);

    WebSplat.addHandler("ontick", function() {
        if (!won && !WebSplat.player.dead) {
            var time = Math.floor((new Date().getTime() - gameTimer - pauseTime) / 500);
            if (gameTime != time) {
                gameTime = time;
                WebSplat.player.stats["gameTime"] = time;
                WebSplat.player.updateStats();
            }
        }
    });

    WebSplat.addHandler("onpause", function() {
        pauseTimer = new Date().getTime();
    });

    WebSplat.addHandler("onresume", function() {
        pauseTime += new Date().getTime() - pauseTimer;
    });

    WebSplat.addHandler("onplatform", function(el) {
        // if this is a small image, make it a coin
        if (el.tagName.toUpperCase() == "IMG" && el.width >= 5 && el.height >= 5) {
            var pos = $(el).offset();

            // otherwise, make it a coin
            var c = el.wpCoin = document.createElement("div");

            $(c).addClass("wpCoinBorder");
            c.style.position = "absolute";
            c.style.left = pos.left-2 + "px";
            c.style.top = pos.top-2 + "px";
            c.style.width = $(el).innerWidth() + "px";
            c.style.height = $(el).innerHeight() + "px";
            try {
                c.style.zIndex = parseInt($(el).css("zIndex")) + 1;
            } catch (ex) {}
            c.wpIgnore = true;
            document.body.appendChild(c);

            el.style.backgrondColor = "gold";
            WebSplat.coins++;
        }
    });

    WebSplat.addHandler("postload", function(player) {
        gameTimer = new Date().getTime();

        // set up the collected/remaining stats
        player.statNames.push("coinsCollected");
        player.statNames.push("coinsLeft");
        player.statNames.push("gameTime");

        player.stats["coinsCollected"] = 0;
        player.stats["coinsLeft"] = WebSplat.coins;
        player.stats["gameTime"] = 0;

        player.statDisplay["coinsCollected"] = "<emph>Images collected:</emph>";
        player.statDisplay["coinsLeft"] = "<emph>Images remaining:</emph>";
        player.statDisplay["gameTime"] = "<emph>Time:</emph>";

        player.updateStats();
    });

    WebSplat.addHandler("oncollide", function(player, el, xs, ys) {
        if ("wpCoin" in el) {
            // remove the coin
            el.wpCoin.style.visibility = "hidden";
            try {
                delete el.wpCoin;
            } catch (ex) {}
            el.wpAllowClip = true;
            el.style.visibility = "hidden";

            // then mark the stats
            WebSplat.coins--;
            player.stats["coinsCollected"]++;
            player.stats["coinsLeft"]--;
            player.updateStats();

            // win?
            if (WebSplat.coins <= 0) {
                // hooray!
                var winnerImg = document.createElement("img");
                winnerImg.src = WebSplat.conf.imageBase + "winner" +
                    ((Math.random()>0.5)?"2":"") +
                    ".png";
                winnerImg.style.position = "fixed";
                winnerImg.style.left = "0px";
                winnerImg.style.top = "0px";
                document.body.appendChild(winnerImg);

                $(winnerImg).click(function() {
                    document.body.removeChild(winnerImg);
                });

                won = true;
            }

            return false;
        }
    });
})();
