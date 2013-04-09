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

///<reference path="websplat.ts" />

module WebSplat {
    export module IO {
        export class IOHandler {
            // override all or any of these
            public activate() { return true; }
            public deactivate() {}
            public onkeydown(key: number) { return true; }
            public onkeyup(key: number) { return true; }
            public onmousedown(ev: JQueryEventObject) { return true; }
            public onmouseup(ev: JQueryEventObject) { return true; }
            public onclick(ev: JQueryEventObject) { return true; }
        }

        export var ioHandler: IOHandler = null;

        export function setIOHandler(to: IOHandler) {
            if (ioHandler !== null)
                unsetIOHandler();
            if (to !== null) {
                ioHandler = to;
                if (!to.activate())
                    ioHandler = null;
            }
        }

        export function unsetIOHandler() {
            ioHandler.deactivate();
            ioHandler = null;
        }

        var keysDown: any = {};

        function markKeyDown(key: number) {
            if (keysDown[key]) {
                return true;
            } else {
                keysDown[key] = true;
                return false;
            }
        }

        function markKeyUp(key: number) {
            delete keysDown[key];
        }

        function translateKey(key: number) {
            switch (key) {
                case 65: key = 37; break; // a -> left
                case 87: key = 38; break; // w -> up
                case 68: key = 39; break; // d -> right
                case 83: key = 40; break; // s -> down
            }
            return key;
        }

        addHandler("postload", function() {
            var keydown = function(ev) {
                if (ev.ctrlKey || ev.altKey || ev.metaKey) return true;

                var key = translateKey(ev.which);
                if (markKeyDown(key)) return false;

                if (ioHandler) {
                    if (ioHandler.onkeydown(key)) {
                        return true;
                    } else {
                        ev.preventDefault();
                        ev.stopPropagation();
                        return false;
                    }
                }
                return true;
            }
            $(document.body).keydown(keydown);
            $(window).keydown(keydown);

            var keyup = function(ev) {
                var key = translateKey(ev.which);
                markKeyUp(key);

                if (ioHandler) {
                    if (ioHandler.onkeyup(key)) {
                        return true;
                    } else {
                        ev.preventDefault();
                        ev.stopPropagation();
                        return false;
                    }
                }
                return true;
            }
            $(document.body).keyup(keyup);
            $(window).keyup(keyup);

            $(document.body).mousedown(function(ev) {
                if (ioHandler) {
                    if (ioHandler.onmousedown(ev)) {
                        return true;
                    } else {
                        ev.preventDefault();
                        ev.stopPropagation();
                        return false;
                    }
                }
                return true;
            });

            $(document.body).mouseup(function(ev) {
                if (ioHandler) {
                    if (ioHandler.onmouseup(ev)) {
                        return true;
                    } else {
                        ev.preventDefault();
                        ev.stopPropagation();
                        return false;
                    }
                }
                return true;
            });

            $(document.body).click(function(ev) {
                if (ioHandler) {
                    if (ioHandler.onclick(ev)) {
                        return true;
                    } else {
                        ev.preventDefault();
                        ev.stopPropagation();
                        return false;
                    }
                }
                return true;
            });
        });
    }
}
