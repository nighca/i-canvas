var util = require('./util');
var $ = require('./lib');

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
    // element status (move, draggable, ...)
    status: {},
    init: function(document, opt){
        this._super.apply(this, arguments);

        // document as enviroment
        this.document = document;

        // init attributes
        this.attr = $.extend(this.attr, opt);
        this.status = $.extend(this.status);
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
            if(handler(this) !== false){
                this.children.forEach(function(child, i){
                    child.walk(handler);
                });
            }
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
    },
    // get range
    getRange: function(){
        var pos = this.getPos(),
            attr = this.attr,
            borderWidth = attr.border ? attr['border-width'] : 0;

        return {
            x: { min: pos.x - borderWidth, max: pos.x + borderWidth },
            y: { min: pos.y - borderWidth, max: pos.y + borderWidth }
        };
    }
});

// types of element [rectangle, circle, ...]
var types = {};

// method to extend dom element type
var extendType = function(name, opt, base){
    base = base ? Element.types[base] : Element;
    opt.attr = $.extend(opt.attr, base.prototype.attr, true);
    Element.types[name] = base.extend(name[0].toUpperCase() + name.slice(1), opt);
};

// method to extend dom element methods
var extendMethod = function(name, method){
    return Element.prototype[name] = method;
};

$.extend(Element, {
    types: {},
    extendType: extendType,
    extendMethod: extendMethod
}, true);

module.exports = Element;