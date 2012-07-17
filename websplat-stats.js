/*
 * Copyright (C) 2010 Gregor Richards
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
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
        this.stats.HP = this.hp + "/" + this.maxHP;
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
                td.innerHTML = "<emph>" + st + ":</emph>";
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
        player.statNames = [];
        player.stats = {};
        player.statTableEl = null;
        player.statTable = {};
        player.statDisplay = {};
        player.statText = "";

        // only show HP if it's interesting
        if (player.maxHP > 1) {
            player.statNames.push("HP");
            player.stats.HP = player.hp;
        }

        // put the stats element in the upper-left corner
        player.statEl = document.createElement("span");
        $(player.statEl).addClass("statBox");

        if (!cssOK) {
            // probably IE (yukk), make it scroll through stupidity
            player.statEl.style.position = "absolute";
            player.statEl.style.backgroundColor = "black";
            player.statEl.style.color = "white";
            $(window).scroll(function() {
                $(player.statEl).css("top", $(window).scrollTop() + "px");
            });
        }
        player.statEl.style.right = "0px";
        player.statEl.style.top = "0px";
        player.statEl.style.paddingRight = "15px";
        player.statEl.style.zIndex = "1000000";
        player.statEl.style.borderLeft = "1px solid black";
        player.statEl.style.borderBottom = "1px solid black";
        player.statEl.wpIgnore = true;
        player.updateStats();
        document.body.appendChild(player.statEl);
    });
})();
