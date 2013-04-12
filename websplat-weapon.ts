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
///<reference path="websplat-pony.ts" />
///<reference path="websplat-line.ts" />
///<reference path="websplat-io.ts" />

module WebSplat {
    export module Weapon {
        export class WeaponW {
            constructor(
                public name: string,
                public ioHandler: IO.IOHandlerConstructor
                ) {}
        }

        export var weapons: WeaponW[] = [];

        // First weapon is the conventional bazooka
        module Bazooka {
            var bazRad = 100;
            var bazPower = 50;
            var bazPowerupTime = 2000;
            var bazSpeed = 30;
            var bazMaxAge = 34;
            var gd = conf.gridDensity;

            var bazPowerMult = bazPower/bazRad;

            var rocketLauncherImageSets = {
                r: <ImageSet> {
                    frames: 1,
                    frameRate: 3,
                    width: 50,
                    height: 50,
                    bb: [16, 16+17, 25, 25+9],
                }
            };

            function Rocket(firedBy) {
                this.expended = false;
                this.firedBy = firedBy;
                Sprite.call(this, "base.", rocketLauncherImageSets, "r", "r", true, false);
                this.slowxacc = 0;
                this.lifespan = bazMaxAge;
                this.ownGravity = 0.5;
            }
            Rocket.prototype = new SpriteChild();

            Rocket.prototype.tick = function() {
                this.thru[this.firedBy.el.wpID] = true;
                Sprite.prototype.tick.call(this);

                this.lifespan--;
                if (this.lifespan <= 0) this.explode();
            }

            Rocket.prototype.collision = function(els, xs, ys) {
                // only for REAL collisions, thank you
                if (els === null) return els;

                this.explode();
                return els;
            }

            Rocket.prototype.explode = function() {
                // only blow up once
                if (this.expended) return;
                this.expended = true;

                // destroy the rocket
                deplatformSprite(this);
                remSprite(this);
                this.el.parentNode.removeChild(this.el);

                curPony = (curPony + 1) % ponies.length;
                player = ponies[curPony];
                assertPlayerViewport();
                this.midFire = false;

                // find all the platforms in this region and destroy them
                var bazX = this.x;
                var bazY = this.y;
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
                        var els = getElementsGridPosition(x, y);
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
                                    sprite.xvel = Math.cos(angle) * (bazRad - dist) * bazPowerMult * ((dx>0)?1:-1);
                                    sprite.forceyvel = Math.sin(angle) * (bazRad - dist) * bazPowerMult * ((dy>0)?1:-1);
                                }
                            } else if ("wpUndestroyable" in el) {
                            } else if (elInDistance(el, bazRad, bazX, bazY)) {
                                remElementPosition(el);
                                el.style.visibility = "hidden";
                            }
                        }
                    }
                }
            }

            class BazookaFireIOHandler extends IO.IOHandler {
                constructor(prev: IO.IOHandler, next: IO.IOHandler) {
                    super(prev, next);
                }

                private line: Line = new Line();

                private mdStart: number = null; // mouse-down start
                private ivID: number = 0; // ID of setInterval used
                private mx: number = 0; // last seen mouse x
                private my: number = 0; // and y

                private firing: any = null;
                private midFire = false;

                public deactivate() {
                    this.line.destroy();
                }

                public onmousedown(ev) {
                    if (this.firing || this.midFire)
                        return true;

                    var iothis = this;
                    this.mdStart = new Date().getTime();
                    this.mx = ev.pageX;
                    this.my = ev.pageY;
                    this.ivID = setInterval(function() {
                        var bazTime = new Date().getTime() - iothis.mdStart;
                        bazTime /= bazPowerupTime;
                        if (bazTime > 1.0) bazTime = 1.0;
                        bazTime = bazTime * 0.75 + 0.25;
                        iothis.line.drawBar(
                            Math.round(player.x + player.w/2), Math.round(player.y),
                            iothis.mx, iothis.my,
                            255, 0, 0, 2, bazTime * 128,
                              0, 0, 0, 3, 128);
                    }, 15);

                    return false;
                }

                public onmousemove(ev) {
                    if (this.mdStart === null) return true;
                    this.mx = ev.pageX;
                    this.my = ev.pageY;
                    return true;
                }

                public onmouseup(ev) {
                    if (player === null) return true;
                    if (this.mdStart === null) return true;

                    clearInterval(this.ivID);

                    // how long have we been holding it down?
                    var bazTime = new Date().getTime() - this.mdStart;
                    this.mdStart = null;
                    bazTime /= bazPowerupTime;
                    if (bazTime > 1.0) bazTime = 1.0;
                    bazTime = bazTime * 0.75 + 0.25;

                    ev.preventDefault();
                    ev.stopPropagation();

                    // figure out the angle that the rocket should be fired at
                    var angle = Math.atan2(ev.pageY - player.y, ev.pageX - player.x);
                    var xvel = Math.cos(angle) * bazSpeed * bazTime;
                    var yvel = Math.sin(angle) * bazSpeed * bazTime;

                    if (<any>player instanceof Pony) {
                        player.state = "c";
                        player.frame = 0;
                        if (xvel < 0) {
                            player.dir = "l";
                        } else {
                            player.dir = "r";
                        }
                    }

                    var rocket = new Rocket(player);
                    rocket.setXY(player.x, player.y);
                    rocket.startingPosition();
                    rocket.xvel = xvel;
                    rocket.yvel = yvel;
                    addSprite(rocket);
                    this.midFire = true;

                    this.advance();

                    return false;
                }

                public onclick(ev) { return false; }
            }

            weapons.push(
                new WeaponW("Bazooka", BazookaFireIOHandler)
                );
        }
    }
}
