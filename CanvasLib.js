/*
*   create by victor zhang
*   create date: 2011-12-26
*   last modify date: 2012-2-22
*/
(function (window, undefined) {
    var layerType = {
        hidden: -1,
        background: 1,
        upBg: 2,
        static: 3,
        dynamic: 4,
        animate: 5
    }

    function Extend() {
        var target, i = 1, options, copy, src;
        if (arguments.length === 1) {
            target = this;
            i = 0;
        }
        else {
            target = arguments[0];
        }
        for (; i < arguments.length; ) {
            if ((options = arguments[i++]) != null)
                for (var name in options) {
                    copy = options[name];
                    src = target[name];
                    if (copy === src)
                        continue;
                    if (copy !== undefined)
                        target[name] = options[name];
                }
        }
    }
    var canvasLib = function (canvasId, width, height) {
        return new canvasLib.fn.createInstance(canvasId, width, height);
    }

    canvasLib.fn = canvasLib.prototype = {
        createInstance: function (containerId, width, height) {
            this.container = document.getElementById(containerId);
            this.container.pp = this.getContainerPosition();
            this.container.innerHTML = "";
            if (!width)
                width = this.container.offsetWidth;
            if (!height)
                height = this.container.offsetHeight;
            this.bottomLayer = new layer(this.container, width, height, layerType.hidden);
            this.backgroundLayer = new layer(this.container, width, height, layerType.background);
            this.upBgLayer = new layer(this.container, width, height, layerType.upBg);
            this.staticLayer = new layer(this.container, width, height, layerType.static);
            this.dynamicLayer = new layer(this.container, width, height, layerType.dynamic);
            this.animateLayer = new layer(this.container, width, height, layerType.animate);
            this.listen();
            //return this;
        },
        getLayer: function (type) {
            if (layerType.background == type) {
                return this.backgroundLayer;
            } else if (layerType.upBg == type) {
                return this.upBgLayer;
            } else if (layerType.static == type) {
                return this.staticLayer;
            }
            else if (layerType.dynamic == type) {
                return this.dynamicLayer;
            }
            else if (layerType.animate == type) {
                return this.animateLayer;
            }
        },
        container: null,
        mousePos: { x: 0, y: 0 }
    }
    canvasLib.fn.createInstance.prototype = canvasLib.fn;

    canvasLib.extend = canvasLib.fn.extend = Extend;
    /*
    canvas event
    */

    canvasLib.fn.extend({
        listen: function () {
            var temp = this;
            this.container.onclick = function (e) {
                temp.click = true;
                temp.mousedown = false;
                temp.mousemove = false;
                temp.mouseup = false;
                temp.handlerEvent(e);
            }
            this.container.onmousedown = function (e) {
                temp.mousedown = true;
                temp.click = false;
                temp.mouseup = false;
                temp.handlerEvent(e);
            };
            this.container.onmousemove = function (e) {
                temp.click = false;
                temp.mousedown = false;
                temp.mousemove = true;
                temp.mouseup = false;
                temp.handlerEvent(e);
            };
            this.container.onmouseup = function (e) {
                temp.click = false;
                temp.mousedown = false;
                temp.mousemove = false;
                temp.mouseup = true;
                temp.handlerEvent(e);
            };
            this.container.onmouseout = function (e) {
                temp.click = false;
                temp.mousedown = false;
                temp.mousemove = false;
                temp.mouseup = false;
                temp.handlerEvent(e);
            };
        },
        handlerEvent: function (e) {
            e = e || window.event;
            this.setMousePosition(e);
            var backCtx = this.bottomLayer.ctx;
            var temp = this;
            var zoom = this.container.style.zoom ? parseFloat(this.container.style.zoom) : 1;
            var s = this.dynamicLayer.getShapes();
            var cp = this.getContainerPosition();
            var scrollT = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
            var scrollL = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;
            e.zoomX = e.clientX + scrollL;
            e.zoomY = e.clientY + scrollT;
            for (var i = 0; i < s.length; i++) {
                var g = s[i];
                var tX = g.x ? g.x : 0;
                var tY = g.y ? g.y : 0;
                var tR = g.r ? g.r : 0;
                g.x = tX * zoom; //handle zoom position
                g.y = tY * zoom;
                g.r = tR * zoom;
                g.draw(backCtx);
                g.x = tX;
                g.y = tY;
                g.r = tR;
                var events = s[i].events;
                if (events && backCtx.isPointInPath(this.mousePos.x, this.mousePos.y)) {//determine whether the mouse is in the current path
                    if (temp.click) {
                        if (events.onclick) {
                            events.onclick.call(g, s[i].data, e);
                        }
                    } else if (temp.mousedown) {
                        if (events.onmousedown) {
                            events.onmousedown.call(g, s[i].data, e);
                        }
                    } else if (temp.mouseup) {
                        if (events.onmouseup) {
                            events.onmouseup.call(g, s[i].data, e);
                        }
                    } else if (temp.mousemove) {
                        if (!g.mouseover) {
                            g.mouseover = true;
                            if (g.events.onmouseover) {
                                g.events.onmouseover.call(g, g.data, e);
                            }
                        } else {
                            if (g.events.onmousemove) {
                                g.events.onmousemove.call(g, g.data, e);
                            }
                        }
                    }
                    break;
                } else {
                    if (g.mouseover) {
                        g.mouseover = false;
                        if (g.events && g.events.onmouseout) {
                            g.events.onmouseout.call(g, g.data, e);
                            break;
                        }
                    }
                }
            }

        },
        setMousePosition: function (e) {
            var pos = this.getContainerPosition();
            var x = e.clientX - pos.left + window.pageXOffset;
            var y = e.clientY - pos.top + window.pageYOffset;
            this.mousePos.x = x;
            this.mousePos.y = y;
        },
        getMousePosition: function () {
            return this.mousePos;
        },
        getContainerPosition: function () {
            var c = this.container; var y = 0; var x = 0;
            while (c && c.tagName != "BODY") {
                y += c.offsetTop - c.scrollTop;
                x += c.offsetLeft - c.scrollLeft;
                var posStyle = this.getStyle(c, "position");
                if (posStyle == "fixed" || posStyle == "absolute") {
                    x += window.pageXOffset;
                    y += window.pageYOffset;
                    break;
                }
                c = c.offsetParent;
            }
            return {
                top: y,
                left: x
            };
        },
        getStyle: function (elem, s) {
            var result = "";
            if (window.getComputedStyle) {
                result = window.getComputedStyle(elem, null)[s]; //.getPropertyValue(s);
            } else if (elem.currentStyle) {
                result = elem.currentStyle[s];
            }
            return result;
        },
        getLayer: function (type) {
            var l;
            if (layerType.dynamic == type) {
                l = this.dynamicLayer;
            } else if (layerType.animate == type) {
                l = this.animateLayer;
            } else if (layerType.upBg == type) {
                l = this.upBgLayer;
            } else if (layerType.static == type) {
                l = this.staticLayer;
            } else {
                l = this.backgroundLayer;
            }
            return l;
        }
    });

    /*
    draw customize shapes
    */
    canvasLib.fn.extend({
        draw: function () {
            //this.backgroundLayer.draw();
            this.upBgLayer.draw();
            this.staticLayer.draw();
            this.dynamicLayer.draw();
        },
        clear: function () {
            //this.removeAll();
            this.upBgLayer.clear();
            this.staticLayer.clear();
            this.dynamicLayer.clear();
        },
        removeAll: function () {
            this.upBgLayer.removeAll();
            this.staticLayer.removeAll();
            this.dynamicLayer.removeAll();
        },
        arrowLine: function (x1, y1, x2, y2, color, type) {
            var l = this.getLayer(type);
            var aLine = new arrowLine(l, x1, y1, x2, y2, color);
            l.addShape(aLine);
            return aLine;
        },
        idCircle: function (x, y, radius, circleColor, text, textColor, data, type) {//an cicle with id on it
            var l = this.getLayer(type);
            var circle = new idCircle(l, x, y, radius, circleColor, text, textColor, data);
            l.addShape(circle);
            return circle;
        },
        custShape: function (fn, propertys, type) {
            var l = this.getLayer(type);
            var s = new shape(fn, propertys);
            l.addShape(s);
            return s;
        }
    });

    /*
    shape
    */
    var shape = function (fn, propertys) {
        Extend(this, propertys);
        this.fn = fn;
    }

    Extend(shape.prototype, {
        draw: function (ctx) {
            this.fn.call(this, ctx);
        }
    });

    var circleFn = function (ctx) {
        ctx.save();
        if (this.translateX != 0 || this.translateY != 0) {
            ctx.translate(this.translateX, this.translateY);
        }
        ctx.fillStyle = this.circleColor ? this.circleColor : "#000000";
        ctx.strokeStyle = this.circleBorderColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = this.textColor ? this.textColor : "#ffcc33";
        ctx.textBaseline = "middle";
        ctx.font = this.font;
        ctx.strokeText(this.text, this.x - this.r / 2, this.y);
        ctx.restore();
    };

    var idCircle = function (layer, x, y, r, circleColor, text, textColor, data) {
        var p = {
            layer: layer,
            ctx: layer.ctx,
            x: x,
            y: y,
            r: r,
            text: text,
            textColor: textColor,
            circleColor: circleColor,
            translateX: 0,
            translateY: 0,
            data: data,
            font: "10px",
            outLines: [],
            inLines: []
        }
        return new shape(circleFn, p);
    }

    var arrowLineFn = function (ctx) {
        var arrowLength = 10;   // length of head in pixels 
        var arrowAngle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineJoin = this.lineJoin;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.lineTo(this.x2 - arrowLength * Math.cos(arrowAngle - Math.PI / 6), this.y2 - arrowLength * Math.sin(arrowAngle - Math.PI / 6));
        ctx.moveTo(this.x2, this.y2);
        ctx.lineTo(this.x2 - arrowLength * Math.cos(arrowAngle + Math.PI / 6), this.y2 - arrowLength * Math.sin(arrowAngle + Math.PI / 6));
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    var arrowLine = function (layer, x1, y1, x2, y2, color) {
        var p = {
            layer: layer,
            ctx: layer.ctx,
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            lineJoin: "round",
            color: color,
            lineWidth: 1
        }
        return new shape(arrowLineFn, p);
    }

    var layer = function (container, width, height, type) {
        this.container = container;
        this.canvas = document.createElement("canvas");
        this.type = type;
        this.ctx = this.canvas.getContext("2d");
        this.shapes = [];
        this.canvas.style["position"] = "absolute";
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style["z-index"] = type;
        this.canvas.id = type;
        this.shapeKey = 0;
        if (type == layerType.hidden) {
            this.canvas.style.display = "none";
            this.ctx.fill = function () { };
            this.ctx.stroke = function () { };
        } else if (type == layerType.background) {//create background grid
            var hw = 15;
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#eeeedd";
            while (hw < this.canvas.height) {
                this.ctx.moveTo(0, hw);
                this.ctx.lineTo(this.canvas.width, hw);
                hw += 15;
            }
            var ww = 15;
            while (ww < this.canvas.width) {
                this.ctx.moveTo(ww, 0);
                this.ctx.lineTo(ww, this.canvas.height);
                ww += 15;
            }
            this.ctx.stroke();
        }
        this.container.appendChild(this.canvas);
    }

    Extend(layer.prototype, {
        addShape: function (s) {//add a shape to current layer
            s.layer = this;
            s.key = this.shapeKey;
            this.shapes[this.shapeKey] = s;
            this.shapeKey++;
        },
        removeAll: function () {
            this.shapeKey = 0;
            this.shapes = [];
        },
        remove: function (s) {//remove target shape from current layer
            if (s.key >= 0) {
                this.shapes.splice(s.key, 1);
                --this.shapeKey;
                for (var i = s.key; i < this.shapeKey; i++) {
                    this.shapes[i].key = i;
                }
            }
            return s;
        },
        moveTop: function (s) {//move current shape to the top 
            if (s.key >= 0) {
                this.shapes.splice(s.key, 1);
                for (var i = s.key; i < this.shapeKey; i++) {
                    this.shapes[i].key = i;
                }
                s.key = this.shapeKey - 1;
            }
            return s;
        },
        getShapes: function () {
            return this.shapes;
        },
        draw: function () {
            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].draw.call(this.shapes[i], this.ctx);
            }
        },
        clear: function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    });

    canvasLib.shape = shape;
    window.canvasLib = window.$canvas = canvasLib;
})(window)
