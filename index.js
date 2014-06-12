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

    /*var getScreenPos = function(element){
        var top = left = 0;
        while(element){
            top += element.offsetTop;
            left += element.offsetLeft;

            element = element.offsetParent;
        }

        return {
            left: left - window.scrollX,
            top: top - window.scrollY
        };
    };*/

    // classes

    var EventEmitter = Class.extend({
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

    var Event = Class.extend({
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

    var Ielement = EventEmitter.extend({
        type: 'element',
        attr: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            background: null
        },
        init: function(canvas, opt){
            this.canvas = canvas;
            this.ctx = canvas.ctx;
            this.type = this.type;

            this.attr = $.extend(this.attr, opt);
            this.children = [];
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
        bind: function(ele, e, handler){
            ele.on(e, handler);

            (this._bindList = this._bindList || []).push({
                element: ele,
                event: e,
                handler: handler
            });
        },
        cleanBind: function(){
            if(this._bindList){
                this._bindList.forEach(function(item){
                    item.element.un(item.event, item.handler);
                });
                this._bindList = [];
            }
        },
        appendChild: function(element){
            if(element && (element instanceof Ielement)){
                this.children.push(element);
                element.parent = this;

                var _this = this;
                var onChildChange = function(e){
                    _this.fire('subtree-modify', e);
                };
                this.bind(element, 'attr-modify', onChildChange);
                this.bind(element, 'subtree-modify', onChildChange);

                this.fire('subtree-modify', {
                    target: this,
                    add: element
                });
            }

            return this;
        },
        createChild: function(type, opt){
            var element = this.canvas.createElement(type, opt);
            this.appendChild(element);

            return element;
        },
        clean: function(){
            var _this = this;
            this.walk(function(element){
                if(element === _this){
                    element.cleanBind();
                    element.children = [];
                    element.fire('subtree-modify', {
                        target: element
                    });
                }else{
                    element.clean();
                }
            }, true);
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

    var Irectangle = Ielement.extend({
        type: 'rectangle',
        attr: {
        },
        draw: function(){
            var attr = this.attr;
            if(attr.background){
                drawRectangle(this.ctx, attr.left, attr.top, attr.width, attr.height, attr.background);
            }

            return this;
        },
        containsPoint: function(x, y){
            var attr = this.attr;
            return (x >= attr.left && x <= attr.left + attr.width) &&
                (y >= attr.top && y <= attr.top + attr.height);
        }
    });

    var Icircle = Ielement.extend({
        type: 'circle',
        attr: {
            radius: 0
        },
        draw: function(){
            var attr = this.attr;
            if(attr.background){
                drawCircle(this.ctx, attr.left, attr.top, attr.radius, attr.background);
            }

            return this;
        },
        containsPoint: function(x, y){
            var attr = this.attr;
            var dd = Math.pow(x - attr.left, 2) + Math.pow(y - attr.top, 2),
                rr = Math.pow(attr.radius, 2);
            return dd <= rr;
        }
    });

    Ielement.types = {
        'rectangle': Irectangle,
        'circle': Icircle
    };

    var Icanvas = EventEmitter.extend({
        init: function(dom, type){
            var canvas = this;

            canvas.dom = dom;
            canvas.ctx = canvas.dom.getContext(type || '2d');

            canvas.width = dom.width;
            canvas.height = dom.height;

            canvas.body = canvas.createElement('rectangle', {
                top: 0,
                left: 0,
                width: canvas.width,
                height: canvas.height,
                background: 'red'
            });

            // redraw while tree modify
            ['attr-modify', 'subtree-modify'].forEach(function(event){
                canvas.body.on(event, function(e){
                    canvas.draw();
                });
            });

            // delegate events
            canvas.delegateEvents();

            canvas.draw();
        },
        delegateEvents: function(){
            var canvas = this,
                dom = canvas.dom,
                body = canvas.body;

            // click & mouse...
            ['click', 'drag', 'drop', 'mousedown', 'mousemove', 'mouseup'].forEach(function(eventName){
                dom.on(eventName, function(e){
                    var x = e.offsetX,
                        y = e.offsetY,
                        origin = e;

                    var target;

                    // get clickedElements
                    body.walk(function(element){
                        if(element.containsPoint(x, y)){
                            target = element;
                        }
                    });

                    var e = new Event({
                        x: x,
                        y: y,
                        offsetX: x - target.left,
                        offsetY: y - target.top,
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
        },
        draw: function(){
            // clean
            this.ctx.clearRect(0, 0, this.width, this.height)

            // walk the tree & draw every element (parent first)
            this.body.walk(function(element){
                element.draw();
            });
        },
        createElement: function(type, opt){
            return Ielement.types[type] ? (new Ielement.types[type](this, opt)) : null;
        }
    });

    window.Icanvas = Icanvas;
})(this, $, Class);