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
    var maxLineOff = 256;
    var linePadding = 32;

    export class Line {
        public canvas: HTMLCanvasElement;
        public ctx: CanvasRenderingContext2D;

        private cLeft = 0;
        private cTop = 0;
        private cWidth = 0;
        private cHeight = 0;

        private r = 0;
        private g = 0;
        private b = 0;
        private t = 1;

        constructor() {
            this.canvas = <HTMLCanvasElement> document.createElement("canvas");
            this.canvas.style.position = "absolute";
            this.canvas.style.left = "0px";
            this.canvas.style.top = "0px";
            this.canvas.width = 0;
            this.canvas.height = 0;
            this.canvas.style.zIndex = conf.zIndexes.ui;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext("2d");
            this.setLineStyle(255, 0, 0, 3);
        }

        public destroy() {
            document.body.removeChild(this.canvas);
        }

        public coverRange(minX: number, minY: number, maxX: number, maxY: number) {
            if (minX > maxX) {
                this.coverRange(maxX, minY, minX, maxY);
                return;
            }
            if (minY > maxY) {
                this.coverRange(minX, maxY, maxX, minY);
                return;
            }

            var changed = false;

            // left-right
            if (this.cLeft > minX || this.cLeft < minX - maxLineOff) {
                changed = true;
                this.cLeft = minX - linePadding;
                if (this.cLeft < 0) this.cLeft = 0;
            }
            var cRight = this.cLeft + this.cWidth;
            if (cRight <= maxX || cRight > maxX + maxLineOff) {
                changed = true;
                cRight = maxX + linePadding;
                this.cWidth = cRight - this.cLeft;
            }

            // top-bottom
            if (this.cTop > minY || this.cTop < minY - maxLineOff) {
                changed = true;
                this.cTop = minY - linePadding;
                if (this.cTop < 0) this.cTop = 0;
            }
            var cBottom = this.cTop + this.cHeight;
            if (cBottom <= maxY || cBottom > maxY + maxLineOff) {
                changed = true;
                cBottom = maxY + linePadding;
                this.cHeight = cBottom - this.cTop;
            }

            // if it's changed, change the element
            if (changed) {
                this.canvas.style.left = this.cLeft + "px";
                this.canvas.style.top = this.cTop + "px";
                this.canvas.width = this.cWidth;
                this.canvas.height = this.cHeight;
                this.assertLineStyle();
            }
        }

        public setLineStyle(r: number, g: number, b: number, t: number) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.t = t;
            this.assertLineStyle();
        }

        public assertLineStyle() {
            this.ctx.strokeStyle = "rgb(" + this.r + "," + this.g + "," + this.b + ")";
            this.ctx.lineWidth = this.t;
        }

        public drawLine(fromX: number, fromY: number, toX: number, toY: number) {
            this.coverRange(fromX, fromY, toX, toY);

            fromX -= this.cLeft;
            toX -= this.cLeft;
            fromY -= this.cTop;
            toY -= this.cTop;

            this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);
            this.ctx.beginPath();
            this.ctx.moveTo(fromX + 0.5, fromY + 0.5);
            this.ctx.lineTo(toX + 0.5, toY + 0.5);
            this.ctx.stroke();
        }

        public drawLineLen(fromX: number, fromY: number, toX: number, toY: number, len:number) {
            var angle = Math.atan2(toX-fromX, toY-fromY);
            toX = Math.round(fromX + Math.sin(angle)*len);
            toY = Math.round(fromY + Math.cos(angle)*len);
            this.drawLine(fromX, fromY, toX, toY);
        }

        public drawBar(fromX: number, fromY: number, toX: number, toY: number,
                       onR: number, onG: number, onB: number, onT: number, onLen: number,
                       offR: number, offG: number, offB: number, offT: number, offLen: number) {
            // figure out where the lines are going to
            var angle = Math.atan2(toX-fromX, toY-fromY);
            var onToX = Math.round(fromX + Math.sin(angle)*onLen);
            var onToY = Math.round(fromY + Math.cos(angle)*onLen);
            var offToX = Math.round(fromX + Math.sin(angle)*offLen);
            var offToY = Math.round(fromY + Math.cos(angle)*offLen);

            // make sure we cover that range
            var lowX = Math.min(fromX, onToX, offToX);
            var highX = Math.max(fromX, onToX, offToX);
            var lowY = Math.min(fromY, onToY, offToY);
            var highY = Math.max(fromY, onToY, offToY);
            this.coverRange(lowX, lowY, highX, highY);

            // adjust it all into the box
            fromX -= this.cLeft;
            onToX -= this.cLeft;
            offToX -= this.cLeft;
            fromY -= this.cTop;
            onToY -= this.cTop;
            offToY -= this.cTop;

            // and finally, draw it
            this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);
            this.setLineStyle(offR, offG, offB, offT);
            this.ctx.beginPath();
            this.ctx.moveTo(fromX + 0.5, fromY + 0.5);
            this.ctx.lineTo(offToX + 0.5, offToY + 0.5);
            this.ctx.stroke();
            this.setLineStyle(onR, onG, onB, onT);
            this.ctx.beginPath();
            this.ctx.moveTo(fromX + 0.5, fromY + 0.5);
            this.ctx.lineTo(onToX + 0.5, onToY + 0.5);
            this.ctx.stroke();
        }
    }
}
