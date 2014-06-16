/*
 * main
 */

(function(window, $, Class, util, undefined){
    'use strict';

    // classes

    var EventEmitter = Class.extend('EventEmitter', {
        on: function(name, handler){
            name = name.toLowerCase();

            var list = this.__e_getList__();

            (list[name] = list[name] || []).push(handler);

            return this;
        },
        un: function(name, handler){
            name = name.toLowerCase();
            var list = this.__e_getList__(),
                handlers = list[name];

            if(handlers){
                if(!handler){
                    list[name] = null;
                }

                var remaining = [];

                for(var i = 0, len = handlers.length; i < len; i++){
                    if(handlers[i] !== handler){
                        remaining.push(handlers[i]);
                    }
                }

                list[name] = remaining.length ? remaining : null;
            }

            return this;
        },
        fire: function(name, data){
            if(Object.prototype.toString.call(name) === '[object Object]' && name.type && !data){
                data = name;
                name = data.type;
            }
            name = name.toLowerCase();

            var list = this.__e_getList__(),
                handlers = list[name];

            if(handlers){
                for(var i = 0, len = handlers.length; i < len; i++){
                    try{
                        handlers[i].call(this, data);
                    }catch(e){
                        console.warn(e);
                    }
                }
            }

            return this;
        },
        __e_getList__: function(){
            if(!this.__e_list__){
                this.__e_list__ = {};
            }

            return this.__e_list__;
        }
    });

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

    var Element = EventEmitter.extend('Element', {
        attr: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            background: null,
            position: 'relative',
            'z-index': null,
            visible: true
        },
        init: function(document, opt){
            this.document = document;

            this.attr = $.extend(this.attr, opt);
            this.children = [];

            // some special usage
            this.__cache__ = {};
        },
        getAttribute: function(key){
            return this.attr[key];
        },
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
        getZIndex: function(){
            return this.attr['z-index'] === null ?
                (this.parent ? this.parent.getZIndex() : 0) :
                this.attr['z-index'];
        },
        draw: function(){
            return this;
        },
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
        containsPoint: function(x, y){
            return false;
        },
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

    Element.types = {};
    var createElementType = function(name, opt, base){
        base = base ? Element.types[base] : Element;
        opt.attr = $.extend(opt.attr, base.prototype.attr, true);
        Element.types[name] = base.extend(name[0].toUpperCase() + name.slice(1), opt);
    };

    createElementType('rectangle', {
        draw: function(canvas){
            var pos = this.getPos(),
                attr = this.attr;
            if(attr.background){
                canvas.drawRectangle(pos.x, pos.y, attr.width, attr.height, attr.background);
            }

            return this;
        },
        containsPoint: function(x, y){
            var pos = this.getPos(),
                attr = this.attr;
            return (x >= pos.x && x <= pos.x + attr.width) &&
                (y >= pos.y && y <= pos.y + attr.height);
        }
    });

    createElementType('circle', {
        attr: {
            radius: 0
        },
        draw: function(canvas){
            var pos = this.getPos(),
                attr = this.attr;
            if(attr.background){
                canvas.drawCircle(pos.x, pos.y, attr.radius, attr.background);
            }

            return this;
        },
        containsPoint: function(x, y){
            var pos = this.getPos(),
                attr = this.attr;
            var dd = Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2),
                rr = Math.pow(attr.radius, 2);
            return dd <= rr;
        }
    });

    var DomManager = EventEmitter.extend('DomManager', {
        init: function(dom){
            this.dom = dom;

            this.__cache__ = {};

            this.body = this.createElement('rectangle', {
                width: dom.width,
                height: dom.height,
                background: 'red'
            });

            // delegate events
            this.delegateEvents();
        },
        createElement: function(type, opt){
            return Element.types[type] ? (new Element.types[type](this, opt)) : null;
        },
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
        delegateEvents: function(){
            var manager = this,
                dom = manager.dom;

            // click & mouse...
            ['click', 'drag', 'drop', 'mousedown', 'mousemove', 'mouseup'].forEach(function(eventName){
                dom.on(eventName, function(e){
                    var x = e.offsetX,
                        y = e.offsetY,
                        origin = e;

                    var target;

                    // get affectedElements
                    var renderQueue = manager.getRenderQueue();
                    for(var i = renderQueue.length - 1; i >= 0; i--){
                        if(renderQueue[i].containsPoint(x, y)){
                            target = renderQueue[i];
                            break;
                        }
                    }

                    manager.fireDomEvent(eventName, {
                        x: x,
                        y: y,
                        origin: origin,
                        target: target
                    });
                });
            });

            // mouseenter & mouseleave

            var getCommonParent = function(e1, e2){
                while(e1 && !e1.contains(e2)){
                    e1 = e1.parent;
                }
                return e1;
            };

            var prev = {};
            ['mouseenter', 'mousemove', 'mouseleave'].forEach(function(eventName){
                dom.on(eventName, function(e){
                    var x = e.offsetX,
                        y = e.offsetY,
                        origin = e;

                    var target;

                    var renderQueue = manager.getRenderQueue();
                    for(var i = renderQueue.length - 1; i >= 0; i--){
                        if(renderQueue[i].containsPoint(x, y)){
                            target = renderQueue[i];
                            break;
                        }
                    }

                    if(target !== prev.target){
                        var parent = getCommonParent(target, prev.target);

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

                    prev = {
                        e: e,
                        target: target
                    };
                });
            });

        }
    });

    var Icanvas = EventEmitter.extend('Icanvas', {
        init: function(dom, type){
            var canvas = this;

            canvas.dom = dom;
            canvas.ctx = canvas.dom.getContext(type || '2d');

            canvas.width = dom.width;
            canvas.height = dom.height;

            canvas.document = new DomManager(dom);

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
        draw: function(){
            var canvas = this,
                ctx = canvas.ctx;

            // clean
            ctx.clearRect(0, 0, this.width, this.height)

            // get the render queue & render one by one
            this.document.getRenderQueue().forEach(function(element){
                element.getAttribute('visible') && element.draw(canvas);
            });
        },
        drawRectangle: function(x, y, w, h, style){
            var ctx = this.ctx,
                originStyle = ctx.fillStyle;

            ctx.fillStyle = style;
            ctx.fillRect(x, y, w, h);

            ctx.fillStyle = originStyle;
        },
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

    window.Icanvas = Icanvas;
})(this, $, Class, util);