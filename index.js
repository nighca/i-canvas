/*
 * main
 * exports Canvas
 */

(function(window, $, Class, util, undefined){
    'use strict';

    // simulated dom-event class
    var DomEvent = Class.extend('DomEvent', {
        prevented: false,
        stopped: false,
        init: function(opt){
            $.extend(this, opt, true);
        },
        preventDefault: function(){
            this.prevented = true;
        },
        stopPropagation: function(){
            this.stopped = true;
        }
    });

    // simulated dom element base class
    var Element = util.EventEmitter.extend('Element', {
        // default attribute values
        attr: {
            top: 0,                     // postion - [ number(100) ]
            left: 0,                    // postion - [ number(100) ]
            width: 0,                   // size - [ number(100) ]
            height: 0,                  // size - [ number(100) ]
            background: null,           // background style - [ color(#333) ]
            position: 'relative',       // position method - [ 'relative', 'absolute' ]
            'z-index': null,            // render queue - [ number(1) ]
            visible: true,              // visibility - [ true, false ]
            'border-width': 0,          // width of border - [ number(1) ]
            border: null                // border style - [ color(#333) ]
        },
        init: function(document, opt){
            // document as enviroment
            this.document = document;

            // init attributes
            this.attr = $.extend(this.attr, opt);
            this.children = [];

            // some special usage
            this.__cache__ = {};
        },
        // ['key']
        getAttribute: function(key){
            return this.attr[key];
        },
        // ['key', val] / [{key: val}]
        setAttribute: function(key, val){
            if($.type(key) === '[object String]'){
                this.attr[key] = val;
                this.document.fireDomEvent('attr-modify', {
                    target: this,
                    attr: key,
                    val: val
                });
            }else{
                var node = this;
                $.forEach(key, function(v, k){
                    node.setAttribute(k, v);
                });
            }

            return this;
        },
        show: function(){
            this.setAttribute('visible', true);
        },
        hide: function(){
            this.setAttribute('visible', false);
        },
        // calculate real position
        getPos: function(){
            var attr = this.attr;

            switch(attr.position){

            case 'absolute':
                return {
                    x: attr.left,
                    y: attr.top
                };

            case 'relative':
                var base = this.parent ? this.parent.getPos() : {
                    x: 0,
                    y: 0
                };

                return {
                    x: base.x + attr.left,
                    y: base.y + attr.top
                };

            default:
                return {
                    x: 0,
                    y: 0
                }
            }
        },
        // calculate real z-index
        getZIndex: function(){
            return this.attr['z-index'] === null ?
                (this.parent ? this.parent.getZIndex() : 0) :
                this.attr['z-index'];
        },
        // draw self on canvas
        draw: function(){
            return this;
        },
        // walk the tree (self as the root) [fn, true/false]
        walk: function(handler, childrenFirst){
            if(!childrenFirst){
                handler(this);
                this.children.forEach(function(child, i){
                    child.walk(handler);
                });
            }else{
                this.children.forEach(function(child, i){
                    child.walk(handler, true);
                });
                handler(this);
            }
        },
        // add element at the end of self's children [element]
        appendChild: function(element){
            if(element && (element instanceof Element) && this.children.indexOf(element) < 0){
                if(element.parent){
                    element.parent.removeChild(element);
                }

                this.children.push(element);
                element.parent = this;

                this.document.fireDomEvent('subtree-modify', {
                    target: this,
                    add: element
                });
            }

            return this;
        },
        // insert element before given node [element, element]
        insertBefore: function(element, ref){
            var pos;
            if(element && (element instanceof Element) && this.children.indexOf(element) < 0 &&
                ref && (ref instanceof Element) && (pos = this.children.indexOf(ref)) >= 0){
                if(element.parent){
                    element.parent.removeChild(element);
                }

                this.children.splice(pos - 1, 0, element);
                element.parent = this;

                this.document.fireDomEvent('subtree-modify', {
                    target: this,
                    add: element
                });
            }

            return this;
        },
        // remove a childnode [element]
        removeChild: function(element){
            var index = -1;
            if(element && (element instanceof Element)){
                index = this.children.indexOf(element);
            }else if(typeof element === 'number'){
                index = element;
                element = this.children[index];
            }else{
                return this;
            }

            if(index >= 0){
                this.children.splice(index, 1);
                element.parent = null;

                this.document.fireDomEvent('subtree-modify', {
                    target: this,
                    remove: element
                });
            }
            return this;
        },
        // contains a position [number, number]
        containsPoint: function(x, y){
            return false;
        },
        // contains a element [element]
        contains: function(element){
            while(element){
                if(element === this){
                    return true;
                }
                element = element.parent;
            }
            return false;
        }
    });

    // types of element [rectangle, circle, ...]
    Element.types = {};

    // simulated dom manager class
    var DomManager = util.EventEmitter.extend('DomManager', {
        init: function(opt){
            // real dom object
            this.dom = opt.dom;

            // size
            this.width = opt.width;
            this.height = opt.height;

            // real size & scale
            this.clientWidth = this.dom.clientWidth;
            this.clientHeight = this.dom.clientHeight;
            this.scaleWidth = this.width / this.clientWidth;
            this.scaleHeight = this.height / this.clientHeight;

            // body element, also dom tree root
            this.body = this.createElement('rectangle', {
                width: this.width,
                height: this.height,
                background: 'red'
            });

            // delegate events
            this.delegateEvents();
        },
        // create new element ['type', {opt}]
        createElement: function(type, opt){
            return Element.types[type] ? (new Element.types[type](this, opt)) : null;
        },
        // fire a dom event(& do bubble) ['type', {data}]
        fireDomEvent: function(type, data){
            var e = new DomEvent($.extend(data, {
                type: type
            }, true));

            var target = e.target;
            
            // fire the dom's event
            target.fire(type, e);

            // need to bubble
            if(['attr-modify', 'mouseenter', 'mouseleave'].indexOf(type) < 0){
                while(target.parent){
                    if(e.stopped) break;
                    (target = target.parent).fire(type, e);
                }
            }

            this.fire('dom-event', {
                domEvent: e
            });
        },
        // get a array as render sequence(decided by tree structure & elements' z-index attribute)
        getRenderQueue: function(){
            var queue = [];
            this.body.walk(function(element){
                element.__cache__.zIndex = null;            // clean cache
                queue.push(element);
            });

            var getZIndex = function(element){
                return element.__cache__.zIndex !== null ? element.__cache__.zIndex : (element.__cache__.zIndex = element.getZIndex());
            };

            queue = util.stableSort(queue, function(e1, e2){
                return getZIndex(e1) > getZIndex(e2);
            });

            return queue;
        },
        // delegate some mouse events('click', 'drag', 'drop', 'mousedown', 'mousemove', 'mouseup', 'mousemove', 'mouseleave', ...)
        delegateEvents: function(){
            var manager = this,
                dom = manager.dom;

            // click & drag, drop, mousedown, mousemove, mouseup

            // these events can be directly delegated
            ['click', 'drag', 'drop', 'mousedown', 'mousemove', 'mouseup'].forEach(function(eventName){
                dom.on(eventName, function(e){
                    var x = e.offsetX * manager.scaleWidth,
                        y = e.offsetY * manager.scaleHeight,
                        origin = e;

                    var target;

                    // get event target

                    var renderQueue = manager.getRenderQueue();
                    for(var i = renderQueue.length - 1; i >= 0; i--){
                        if(renderQueue[i].containsPoint(x, y)){
                            target = renderQueue[i];
                            break;
                        }
                    }

                    target && manager.fireDomEvent(eventName, {
                        x: x,
                        y: y,
                        origin: origin,
                        target: target
                    });
                });
            });

            // mouseenter & mouseleave

            // to record prev info
            var prev = {};

            // these three may cause 'mouseenter' or 'mouseleave'
            ['mouseenter', 'mousemove', 'mouseleave'].forEach(function(eventName){
                dom.on(eventName, function(e){
                    var x = e.offsetX * manager.scaleWidth,
                        y = e.offsetY * manager.scaleHeight,
                        origin = e;

                    var target;

                    // get event target

                    var renderQueue = manager.getRenderQueue();
                    for(var i = renderQueue.length - 1; i >= 0; i--){
                        if(renderQueue[i].containsPoint(x, y)){
                            target = renderQueue[i];
                            break;
                        }
                    }

                    // different targets while move
                    if(target !== prev.target){
                        var parent = prev.target;

                        // get common parent
                        while(parent && !parent.contains(target)){
                            parent = parent.parent;
                        }

                        // fire mouseleave for prev target (bubble until common parent)
                        var element = prev.target;
                        while(element !== parent){
                            manager.fireDomEvent('mouseleave', {
                                x: x,
                                y: y,
                                origin: origin,
                                target: element
                            });
                            element = element.parent;
                        }

                        // fire mouseenter for current target (bubble until common parent)
                        element = target;
                        while(element !== parent){
                            manager.fireDomEvent('mouseenter', {
                                x: x,
                                y: y,
                                origin: origin,
                                target: element
                            });
                            element = element.parent;
                        }
                    }

                    // record target & event
                    prev = {
                        e: e,
                        target: target
                    };
                });
            });

        }
    });

    // simulated dom manager class
    var Canvas = util.EventEmitter.extend('Canvas', {
        init: function(dom, type){
            var canvas = this;

            // real dom & canvas-ctx
            canvas.dom = dom;
            canvas.ctx = canvas.dom.getContext(type || '2d');

            // canvas size
            canvas.width = dom.width;
            canvas.height = dom.height;

            // simulated document
            canvas.document = new DomManager({
                dom: dom,
                width: canvas.width,
                height: canvas.height
            });

            // redraw while tree modify
            var timer;
            canvas.document.on('dom-event', function(e){
                if(['attr-modify', 'subtree-modify'].indexOf(e.domEvent.type) >= 0){
                    clearTimeout(timer);
                    timer = setTimeout(function(){
                        canvas.draw();
                    }, 0);
                }
            });

            canvas.draw();
        },
        // draw all elements on the canvas
        draw: function(){
            var canvas = this,
                ctx = canvas.ctx;

            // clean canvas
            ctx.clearRect(0, 0, this.width, this.height)

            // get the render sequence & render one by one
            this.document.getRenderQueue().forEach(function(element){
                element.getAttribute('visible') && element.draw(canvas);
            });
        },
        // method to draw a rectangle
        drawRectangle: function(x, y, w, h, style){
            var ctx = this.ctx,
                originStyle = ctx.fillStyle;

            ctx.fillStyle = style;
            ctx.fillRect(x, y, w, h);

            ctx.fillStyle = originStyle;
        },
        // method to draw a circle
        drawCircle: function(x, y, r, style){
            var ctx = this.ctx,
                originStyle = ctx.fillStyle;

            ctx.fillStyle = style;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2, true);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = originStyle;
        }
    });

    // method to extend dom element type
    var extendElementType = function(name, opt, base){
        base = base ? Element.types[base] : Element;
        opt.attr = $.extend(opt.attr, base.prototype.attr, true);
        Element.types[name] = base.extend(name[0].toUpperCase() + name.slice(1), opt);
    };

    // simulated dom element class - rectangle
    extendElementType('rectangle', {
        // realize rectangle-draw
        draw: function(canvas){
            var pos = this.getPos(),
                attr = this.attr;

            if(attr.border){
                var borderWidth = attr['border-width'];
                canvas.drawRectangle(pos.x - borderWidth, pos.y - borderWidth, attr.width + borderWidth * 2, attr.height + borderWidth * 2, attr.border);
            }

            if(attr.background){
                canvas.drawRectangle(pos.x, pos.y, attr.width, attr.height, attr.background);
            }

            return this;
        },
        // realize rectangle-contain
        containsPoint: function(x, y){
            var pos = this.getPos(),
                attr = this.attr,
                borderWidth = attr.border ? attr['border-width'] : 0;
            return (x >= pos.x - borderWidth && x <= pos.x + attr.width + borderWidth) &&
                (y >= pos.y - borderWidth && y <= pos.y + attr.height + borderWidth);
        }
    });

    // simulated dom element class - circle
    extendElementType('circle', {
        attr: {
            radius: 0                   // size - [ number(100) ]
        },
        // realize circle-draw
        draw: function(canvas){
            var pos = this.getPos(),
                attr = this.attr;

            if(attr.border){
                var borderWidth = attr['border-width'];
                canvas.drawCircle(pos.x, pos.y, attr.radius + borderWidth, attr.border);
            }

            if(attr.background){
                canvas.drawCircle(pos.x, pos.y, attr.radius, attr.background);
            }

            return this;
        },
        // realize circle-contain
        containsPoint: function(x, y){
            var pos = this.getPos(),
                attr = this.attr,
                borderWidth = attr.border ? attr['border-width'] : 0;
            var dd = Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2),
                rr = Math.pow(attr.radius + borderWidth, 2);
            return dd <= rr;
        }
    });

    // method to extend dom element methods
    var extendElementMethod = function(name, method){
        return Element.prototype[name] = method;
    };

    // export

    $.extend(Canvas, {
        extendElementType: extendElementType,
        extendElementMethod: extendElementMethod
    }, true);

    $.extend(window, {
        Canvas: Canvas
    }, true)

})(this, $, Class, util);