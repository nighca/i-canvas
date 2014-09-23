var Class = require('./class');
var util = require('./util');
var $ = require('./lib');
var Element = require('./element');

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
    // get a array as render sequence(decided by tree structure & elements' visible/z-index attribute)
    getRenderQueue: function(){
        var queue = [];
        this.body.walk(function(element){
            element.__cache__.zIndex = null;            // clean cache

            if(element.getAttribute('visible')){
                queue.push(element);
            }else{
                return false;
            }
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

        // touchstart & touchmove, touchend, touchcancel

        // these events can be directly delegated
        ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function(eventName){
            dom.on(eventName, function(e){
                var evt = {
                    x: 0,
                    y: 0,
                    origin: e,
                    target: dom
                },
                    offsetLeft = dom.offsetLeft,
                    offsetTop = dom.offsetTop;

                // process touch list
                ['touches', 'targetTouches', 'changedTouches'].forEach(function(field){
                    evt[field] = Array.prototype.slice.call(e[field]).map(function(touch){
                        var x = (touch.clientX - offsetLeft) * manager.scaleWidth,
                            y = (touch.clientY - offsetTop) * manager.scaleHeight,
                            origin = touch;

                        var target;

                        // get event target

                        var renderQueue = manager.getRenderQueue();
                        for(var i = renderQueue.length - 1; i >= 0; i--){
                            if(renderQueue[i].containsPoint(x, y)){
                                target = renderQueue[i];
                                break;
                            }
                        }

                        return {
                            x: x,
                            y: y,
                            origin: origin,
                            target: target
                        }; 
                    });
                });

                // trigger one by one
                evt.changedTouches.forEach(function(touch){
                    touch.target && manager.fireDomEvent(eventName, $.extend(evt, {
                        target: touch.target
                    }));
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

module.exports = DomManager;