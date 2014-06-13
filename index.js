(function(window, $, Class, undefined){

    // helpers
    var drawRectangle = function(ctx, x, y, w, h, style){
        var originStyle = ctx.fillStyle;

        ctx.fillStyle = style;
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = originStyle;
    };
    var drawCircle = function(ctx, x, y, r, style){
        var originStyle = ctx.fillStyle;

        ctx.fillStyle = style;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = originStyle;
    };

    // classes

    var EventEmitter = Class.extend('EventEmitter', {
        on: function(name, handler){
            name = name.toLowerCase();

            var list = this._ep_getList();

            (list[name] = list[name] || []).push(handler);

            return this;
        },
        un: function(name, handler){
            name = name.toLowerCase();
            var list = this._ep_getList(),
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

            var list = this._ep_getList(),
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
        _ep_getList: function(){
            if(!this._ep_list){
                this._ep_list = {};
            }

            return this._ep_list;
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

    var Ielement = EventEmitter.extend('Ielement', {
        type: 'element',
        attr: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            background: null,
            position: 'relative',
            'z-index': null
        },
        init: function(document, opt){
            this.document = document;
            this.type = this.type;

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
                this.fire('attr-modify', {
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
            if(element && (element instanceof Ielement)){
                this.children.push(element);
                element.parent = this;

                
            }

            return this;
        },
        createChild: function(type, opt){
            var element = this.document.createElement(type, opt);
            this.appendChild(element);

            return element;
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

    Ielement.types = {};
    var createElementType = function(name, opt){
        opt.type = name;
        opt.attr = $.extend(opt.attr, Ielement.prototype.attr, true);
        Ielement.types[name] = Ielement.extend(name.toUpperCase(), opt);
    };

    createElementType('rectangle', {
        draw: function(ctx){
            var pos = this.getPos(),
                attr = this.attr;
            if(attr.background){
                drawRectangle(ctx, pos.x, pos.y, attr.width, attr.height, attr.background);
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
        draw: function(ctx){
            var pos = this.getPos(),
                attr = this.attr;
            if(attr.background){
                drawCircle(ctx, pos.x, pos.y, attr.radius, attr.background);
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

            this.root = this.createElement('rectangle', {
                width: dom.width,
                height: dom.height,
                background: 'red'
            });

            // delegate events
            canvas.delegateEvents();
        },
        createElement: function(type, opt){
            return Ielement.types[type] ? (new Ielement.types[type](this, opt)) : null;
        },
        fireDomEvent: function(type, e){
            e = new DomEvent(e);
            e.type = type;

            var target = e.target;

            while(target){
                target.fire(type, e);

                if(e.stopped) break;

                target = target.parent;
            }

            this.fire('dom-event', e);
        },
        getRenderQueue: function(){
            var queue = [];
            this.root.walk(function(element){
                element.__cache__.zIndex = null;
                queue.push(element);
            });

            var getZIndex = function(element){
                return element.__cache__.zIndex !== null ? element.__cache__.zIndex : element.getZIndex();
            };

            queue.sort(function(e1, e2){
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

                    // get clickedElements
                    var renderQueue = manager.getRenderQueue();
                    for(var i = renderQueue.length - 1; i >= 0; i--){
                        if(renderQueue[i].containsPoint(x, y)){
                            target = renderQueue[i];
                            break;
                        }
                    }

                    var e = new DomEvent({
                        x: x,
                        y: y,
                        origin: origin,
                        target: target
                    });
                    while(target){
                        target.fire(eventName, e);

                        if(e.stopped) break;

                        target = target.parent;
                    }
                });
            });

            // mouseenter & mouseleave
            /*['mouseenter', 'mousemove', 'mouseleave'].forEach(function(eventName){
                dom.on(eventName, function(e){
                    var x = e.offsetX,
                        y = e.offsetY,
                        origin = e;

                    var target;


                });
            });*/

        }
    });

    var Icanvas = EventEmitter.extend('Icanvas', {
        init: function(dom, type){
            var canvas = this;

            canvas.dom = dom;
            canvas.ctx = canvas.dom.getContext(type || '2d');

            canvas.width = dom.width;
            canvas.height = dom.height;

            canvas.domManager = new DomManager(dom);

            // redraw while tree modify
            canvas.domManager.on('dom-event', function(e){
                if([].indexOf(e.type) >= 0){
                    canvas.draw();
                }
            });

            canvas.draw();
        },
        draw: function(){
            var ctx = this.ctx;

            // clean
            ctx.clearRect(0, 0, this.width, this.height)

            // get the render queue & render one by one
            this.domManager.getRenderQueue().forEach(function(element){
                element.draw(ctx);
            });
        }
    });

    window.Icanvas = Icanvas;
})(this, $, Class);