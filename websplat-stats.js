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
    // need a style for the box
    var statStyle = document.createElement("style");
    var cssOK = true;
    try {
        statStyle.innerHTML = ".statBox {\n" +
            "position: fixed;\n" +
            "background: rgba(0,0,0,0.65) !important;\n" +
            "}\n" +
            ".statTable {\n" +
            "background: transparent !important;\n" +
            "}\n" +
            ".statTd {\n" +
            "color: white !important;\n" +
            "}\n";
    } catch (ex) {
        cssOK = false;
    }
    document.getElementsByTagName("head")[0].appendChild(statStyle);

    WebSplat.Player.prototype.onChangeHP = function() {
        this.updateStats();
    }

    // update the stats element
    WebSplat.Player.prototype.updateStats = function() {
        retry: while (true) {
            // first try to just update each stat
            for (var i = 0; i < this.statNames.length; i++) {
                var st = this.statNames[i];
                if (!(st in this.statTable)) {
                    this.generateStatTable();
                    continue retry;
                }

                // OK, it exists, update it
                this.statTable[st].innerHTML = this.stats[st];
            }

            break;
        }

        // update HP
        if ("statHPEl" in this) {
            var i;
            for (i = 0; i < this.hp; i++) {
                this.statHeartEls[i].style.visibility = "visible";
            }
            for (; i < this.maxHP; i++) {
                this.statHeartEls[i].style.visibility = "hidden";
            }
        }
    }

    // generate the stats table
    WebSplat.Player.prototype.generateStatTable = function() {
        if (this.statTableEl !== null) {
            // get rid of this one first
            this.statEl.removeChild(this.statTableEl);
        }
        this.statTable = {};

        // now build a new one
        var table = this.statTableEl = document.createElement("table");
        $(table).addClass("statTable");
        var tbody = document.createElement("tbody");
        table.border = "0";

        // create all the stats
        for (var i = 0; i < this.statNames.length; i++) {
            var st = this.statNames[i];
            var row = document.createElement("tr");

            var td = document.createElement("td");
            $(td).addClass("statTd");
            if (!cssOK) td.style.color = "white";
            if (st in this.statDisplay) {
                td.innerHTML = this.statDisplay[st];
            } else {
                td.innerHTML = st + ":";
            }
            row.appendChild(td);

            this.statTable[st] = td = document.createElement("td");
            $(td).addClass("statTd");
            if (!cssOK) td.style.color = "white";
            td.innerHTML = this.stats[st];
            row.appendChild(td);

            tbody.appendChild(row);
        }

        // then put it in the box
        table.appendChild(tbody);
        this.statEl.appendChild(table);
    }

    WebSplat.addHandler("postload", function(player) {
        if (!("statNames" in player)) {
            player.statNames = [];
            player.stats = {};
            player.statDisplay = {};
        }
        player.statTableEl = null;
        player.statTable = {};
        player.statText = "";

        var els = ["statEl"];

        // only show HP if it's interesting
        if (player.maxHP > 1)
            els.push("statHPEl");

        // make the stats elements
        for (var eli = 0; eli < els.length; eli++) {
            var el = els[eli];
            player[el] = document.createElement("span");
            $(player[el]).addClass("statBox");

            if (!cssOK) {
                // probably IE (yukk), make it scroll through stupidity
                player[el].style.position = "absolute";
                player[el].style.backgroundColor = "black";
                player[el].style.color = "white";
                $(window).scroll((function(el) { return function() {
                    $(player[el]).css("top", $(window).scrollTop() + "px");
                }; })(el));
            }
            if (el == "statEl") {
                player[el].style.right = "0px";
                player[el].style.borderLeft = "1px solid black";
            } else {
                player[el].style.left = "0px";
                player[el].style.borderRight = "1px solid black";
            }
            player[el].style.top = "0px";
            player[el].style.borderBottom = "1px solid black";
            player[el].style.padding = "4px";
            player[el].style.zIndex = "1000000";
            player[el].wpIgnore = true;
            document.body.appendChild(player[el]);
        }

        // make hearts if we need them
        if (player.maxHP > 1) {
            player.statHeartEls = [];
            for (var i = 0; i < player.maxHP; i++) {
                if (i != 0) player.statHPEl.appendChild(document.createTextNode(" "));
                var heart = document.createElement("img");
                heart.src = WebSplat.conf.imageBase + "heart.png";
                player.statHPEl.appendChild(heart);
                player.statHeartEls.push(heart);
            }
        }

        player.updateStats();
    });
})();
