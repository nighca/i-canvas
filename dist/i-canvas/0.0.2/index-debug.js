define("i-canvas/0.0.2/index-debug", [], function(require, exports, module) {
  /*
   * canvas
   * exports Canvas
   */
  // core
  var Canvas = require("i-canvas/0.0.2/core-debug");
  // element types
  require("i-canvas/0.0.2/element/rectangle-debug");
  require("i-canvas/0.0.2/element/circle-debug");
  // plugins
  require("i-canvas/0.0.2/plugin/movable-debug");
  module.exports = Canvas;
});
define("i-canvas/0.0.2/core-debug", [], function(require, exports, module) {
  /*
   * core
   * exports Canvas core
   */
  var Canvas = require("i-canvas/0.0.2/lib/canvas-debug");
  var Element = require("i-canvas/0.0.2/lib/element-debug");
  // export methods
  $.extend(Canvas, {
    extendElementType: Element.extendType,
    extendElementMethod: Element.extendMethod
  }, true);
  module.exports = Canvas;
});
define("i-canvas/0.0.2/lib/canvas-debug", [], function(require, exports, module) {
  var util = require("i-canvas/0.0.2/lib/util-debug");
  var DomManager = require("i-canvas/0.0.2/lib/dom-debug");
  // simulated dom manager class
  var Canvas = util.EventEmitter.extend('Canvas', {
    init: function(dom, type) {
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
      canvas.document.on('dom-event', function(e) {
        if (['attr-modify', 'subtree-modify'].indexOf(e.domEvent.type) >= 0) {
          clearTimeout(timer);
          timer = setTimeout(function() {
            canvas.draw();
          }, 0);
        }
      });
      canvas.draw();
    },
    // draw all elements on the canvas
    draw: function() {
      var canvas = this,
        ctx = canvas.ctx;
      // clean canvas
      ctx.clearRect(0, 0, this.width, this.height)
      // get the render sequence & render one by one
      this.document.getRenderQueue().forEach(function(element) {
        element.getAttribute('visible') && element.draw(canvas);
      });
    },
    // method to draw a rectangle
    drawRectangle: function(x, y, w, h, style) {
      var ctx = this.ctx,
        originStyle = ctx.fillStyle;
      ctx.fillStyle = style;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = originStyle;
    },
    // method to draw a circle
    drawCircle: function(x, y, r, style) {
      var ctx = this.ctx,
        originStyle = ctx.fillStyle;
      ctx.fillStyle = style;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = originStyle;
    }
  });
  module.exports = Canvas;
});
define("i-canvas/0.0.2/lib/util-debug", [], function(require, exports, module) {
  /*
   * helper methods
   * exports util
   */
  'use strict';
  var Class = require("i-canvas/0.0.2/lib/class-debug");
  // merge sort realization
  // tips: array.prototype.sort is stable in some browsers(e.g. firefox) while unstable in some others(e.g. chrome)
  //       such result is not (maybe also will not be) ensured
  var stableSort = function(arr, fn) {
    var l = arr.length;
    switch (l) {
      case 0:
      case 1:
        return arr;
      case 2:
        // faster than call recursively
        return fn(arr[0], arr[1]) ? [arr[1], arr[0]] : arr;
      default:
        var pos = Math.floor(l / 2),
          l1 = pos,
          l2 = l - pos,
          arr1 = stableSort(arr.slice(0, pos), fn),
          arr2 = stableSort(arr.slice(pos), fn);
        arr = [];
        for (var i = 0, j = 0; i <= l1 - 1 || j <= l2 - 1;) {
          if (i > l1 - 1) {
            arr.push(arr2[j++]);
          } else if (j > l2 - 1) {
            arr.push(arr1[i++]);
          } else {
            if (fn(arr1[i], arr2[j])) {
              arr.push(arr2[j++]);
            } else {
              arr.push(arr1[i++]);
            }
          }
        }
        return arr;
    }
  };
  // event emitter class
  var EventEmitter = Class.extend('EventEmitter', {
    on: function(name, handler) {
      name = name.toLowerCase();
      var list = this.__eventGetList__();
      (list[name] = list[name] || []).push(handler);
      return this;
    },
    un: function(name, handler) {
      name = name.toLowerCase();
      var list = this.__eventGetList__(),
        handlers = list[name];
      if (handlers) {
        if (!handler) {
          list[name] = null;
        }
        var remaining = [];
        for (var i = 0, len = handlers.length; i < len; i++) {
          if (handlers[i] !== handler) {
            remaining.push(handlers[i]);
          }
        }
        list[name] = remaining.length ? remaining : null;
      }
      return this;
    },
    fire: function(name, data) {
      if (Object.prototype.toString.call(name) === '[object Object]' && name.type && !data) {
        data = name;
        name = data.type;
      }
      name = name.toLowerCase();
      var list = this.__eventGetList__(),
        handlers = list[name];
      if (handlers) {
        for (var i = 0, len = handlers.length; i < len; i++) {
          try {
            handlers[i].call(this, data);
          } catch (e) {
            console.warn(e);
          }
        }
      }
      return this;
    },
    __eventGetList__: function() {
      if (!this.__eventList__) {
        this.__eventList__ = {};
      }
      return this.__eventList__;
    }
  });
  // export
  module.exports = {
    stableSort: stableSort,
    EventEmitter: EventEmitter
  };
});
define("i-canvas/0.0.2/lib/class-debug", [], function(require, exports, module) {
  /* Simple JavaScript Inheritance
   * By John Resig http://ejohn.org/
   * MIT Licensed.
   */
  // Inspired by base2 and Prototype
  // Updated by nighca for some personal usage
  // exports Class
  var initializing = false,
    fnTest = /xyz/.test(function() {
      xyz;
    }) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function() {};
  // Create a new Class that inherits from this class
  Class.extend = function(className, prop) {
    if (!prop) {
      prop = className;
      className = 'Anonymous';
    }
    var _super = this.prototype;
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn) {
        return function() {
          var tmp = this._super;
          // Add a new ._super() method that is the same method
          // but on the super-class
          this._super = _super[name];
          // The method only need to be bound temporarily, so we
          // remove it when we're done executing
          var ret = fn.apply(this, arguments);
          this._super = tmp;
          return ret;
        };
      })(name, prop[name]) : prop[name];
    }
    // The dummy class constructor
    var Class = eval('(function ' + className + '() {\
    if ( !initializing && this.init )\
      this.init.apply(this, arguments);\
  })');
    // Populate our constructed prototype object
    Class.prototype = prototype;
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
    // And make this class extendable
    Class.extend = arguments.callee;
    return Class;
  };
  module.exports = Class;
});
define("i-canvas/0.0.2/lib/dom-debug", [], function(require, exports, module) {
  var Class = require("i-canvas/0.0.2/lib/class-debug");
  var util = require("i-canvas/0.0.2/lib/util-debug");
  var $ = require("i-canvas/0.0.2/lib/lib-debug");
  var Element = require("i-canvas/0.0.2/lib/element-debug");
  // simulated dom-event class
  var DomEvent = Class.extend('DomEvent', {
    prevented: false,
    stopped: false,
    init: function(opt) {
      $.extend(this, opt, true);
    },
    preventDefault: function() {
      this.prevented = true;
    },
    stopPropagation: function() {
      this.stopped = true;
    }
  });
  // simulated dom manager class
  var DomManager = util.EventEmitter.extend('DomManager', {
    init: function(opt) {
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
    createElement: function(type, opt) {
      return Element.types[type] ? (new Element.types[type](this, opt)) : null;
    },
    // fire a dom event(& do bubble) ['type', {data}]
    fireDomEvent: function(type, data) {
      var e = new DomEvent($.extend(data, {
        type: type
      }, true));
      var target = e.target;
      // fire the dom's event
      target.fire(type, e);
      // need to bubble
      if (['attr-modify', 'mouseenter', 'mouseleave'].indexOf(type) < 0) {
        while (target.parent) {
          if (e.stopped) break;
          (target = target.parent).fire(type, e);
        }
      }
      this.fire('dom-event', {
        domEvent: e
      });
    },
    // get a array as render sequence(decided by tree structure & elements' z-index attribute)
    getRenderQueue: function() {
      var queue = [];
      this.body.walk(function(element) {
        element.__cache__.zIndex = null; // clean cache
        queue.push(element);
      });
      var getZIndex = function(element) {
        return element.__cache__.zIndex !== null ? element.__cache__.zIndex : (element.__cache__.zIndex = element.getZIndex());
      };
      queue = util.stableSort(queue, function(e1, e2) {
        return getZIndex(e1) > getZIndex(e2);
      });
      return queue;
    },
    // delegate some mouse events('click', 'drag', 'drop', 'mousedown', 'mousemove', 'mouseup', 'mousemove', 'mouseleave', ...)
    delegateEvents: function() {
      var manager = this,
        dom = manager.dom;
      // click & drag, drop, mousedown, mousemove, mouseup
      // these events can be directly delegated
      ['click', 'drag', 'drop', 'mousedown', 'mousemove', 'mouseup'].forEach(function(eventName) {
        dom.on(eventName, function(e) {
          var x = e.offsetX * manager.scaleWidth,
            y = e.offsetY * manager.scaleHeight,
            origin = e;
          var target;
          // get event target
          var renderQueue = manager.getRenderQueue();
          for (var i = renderQueue.length - 1; i >= 0; i--) {
            if (renderQueue[i].containsPoint(x, y)) {
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
      ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function(eventName) {
        dom.on(eventName, function(e) {
          var evt = {
              x: 0,
              y: 0,
              origin: e,
              target: dom
            },
            offsetLeft = dom.offsetLeft,
            offsetTop = dom.offsetTop;
          // process touch list
          ['touches', 'targetTouches', 'changedTouches'].forEach(function(field) {
            evt[field] = Array.prototype.slice.call(e[field]).map(function(touch) {
              var x = (touch.clientX - offsetLeft) * manager.scaleWidth,
                y = (touch.clientY - offsetTop) * manager.scaleHeight,
                origin = touch;
              var target;
              // get event target
              var renderQueue = manager.getRenderQueue();
              for (var i = renderQueue.length - 1; i >= 0; i--) {
                if (renderQueue[i].containsPoint(x, y)) {
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
          evt.changedTouches.forEach(function(touch) {
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
      ['mouseenter', 'mousemove', 'mouseleave'].forEach(function(eventName) {
        dom.on(eventName, function(e) {
          var x = e.offsetX * manager.scaleWidth,
            y = e.offsetY * manager.scaleHeight,
            origin = e;
          var target;
          // get event target
          var renderQueue = manager.getRenderQueue();
          for (var i = renderQueue.length - 1; i >= 0; i--) {
            if (renderQueue[i].containsPoint(x, y)) {
              target = renderQueue[i];
              break;
            }
          }
          // different targets while move
          if (target !== prev.target) {
            var parent = prev.target;
            // get common parent
            while (parent && !parent.contains(target)) {
              parent = parent.parent;
            }
            // fire mouseleave for prev target (bubble until common parent)
            var element = prev.target;
            while (element !== parent) {
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
            while (element !== parent) {
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
});
define("i-canvas/0.0.2/lib/lib-debug", [], function(require, exports, module) {
  /*
   * https://github.com/nighca/lib
   * exports lib
   */
  'use strict';
  // helpers
  var type = Object.prototype.toString.call.bind(Object.prototype.toString);
  var forEach = function(object, handler) {
    if (type(object) === '[object Array]') {
      for (var i = 0, l = object.length; i < l && handler.call(this, object[i], i) !== false; i++);
      return;
    }
    for (var key in object)
      if (object.hasOwnProperty(key) && handler.call(this, object[key], key) === false) return;
  };
  var clone = function(obj) {
    if (!obj) return obj;
    var o = new obj.constructor();
    forEach(obj, function(val, key) {
      o[key] = val
    });
    return o;
  };
  var extend = function(target, addon, self) {
    target = (self ? target : clone(target)) || {};
    forEach(addon, function(val, key) {
      target[key] = val;
    });
    return target;
  };
  var fns = {
    on: HTMLElement.prototype.addEventListener,
    un: HTMLElement.prototype.removeEventListener,
    css: function(key, val) {
      var ele = this;
      return type(key) === '[object String]' ? this.style.setProperty(key, val) : forEach(key, function(v, k) {
        ele.css(k, v);
      });
    },
    show: function() {
      this.css('display', '')
    },
    hide: function() {
      this.css('display', 'none')
    },
    find: function(selector) {
      return $(selector, this)
    },
    parent: function() {
      return decorate(this.parentNode)
    }
  };
  var decorate = function(element) {
    return element ? extend(element, fns, true) : element;
  };
  var $ = function(selector, node) {
    return decorate(type(selector) === '[object String]' ? (node || document).querySelector(selector) : selector);
  };
  var $$ = function(selector, node) {
    return Array.prototype.slice.call(type(selector) === '[object String]' ? (node || document).querySelectorAll(selector) : selector).map(decorate);
  };
  // export helpers
  extend($, {
    type: type,
    forEach: forEach,
    clone: clone,
    extend: extend,
    $: $$
  }, true);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = $;
  } else {
    extend(window, {
      $: $,
      $$: $$
    }, true);
  }
});
define("i-canvas/0.0.2/lib/element-debug", [], function(require, exports, module) {
  var util = require("i-canvas/0.0.2/lib/util-debug");
  var $ = require("i-canvas/0.0.2/lib/lib-debug");
  // simulated dom element base class
  var Element = util.EventEmitter.extend('Element', {
    // default attribute values
    attr: {
      top: 0, // postion - [ number(100) ]
      left: 0, // postion - [ number(100) ]
      width: 0, // size - [ number(100) ]
      height: 0, // size - [ number(100) ]
      background: null, // background style - [ color(#333) ]
      position: 'relative', // position method - [ 'relative', 'absolute' ]
      'z-index': null, // render queue - [ number(1) ]
      visible: true, // visibility - [ true, false ]
      'border-width': 0, // width of border - [ number(1) ]
      border: null // border style - [ color(#333) ]
    },
    init: function(document, opt) {
      // document as enviroment
      this.document = document;
      // init attributes
      this.attr = $.extend(this.attr, opt);
      this.children = [];
      // some special usage
      this.__cache__ = {};
    },
    // ['key']
    getAttribute: function(key) {
      return this.attr[key];
    },
    // ['key', val] / [{key: val}]
    setAttribute: function(key, val) {
      if ($.type(key) === '[object String]') {
        this.attr[key] = val;
        this.document.fireDomEvent('attr-modify', {
          target: this,
          attr: key,
          val: val
        });
      } else {
        var node = this;
        $.forEach(key, function(v, k) {
          node.setAttribute(k, v);
        });
      }
      return this;
    },
    show: function() {
      this.setAttribute('visible', true);
    },
    hide: function() {
      this.setAttribute('visible', false);
    },
    // calculate real position
    getPos: function() {
      var attr = this.attr;
      switch (attr.position) {
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
    getZIndex: function() {
      return this.attr['z-index'] === null ? (this.parent ? this.parent.getZIndex() : 0) : this.attr['z-index'];
    },
    // draw self on canvas
    draw: function() {
      return this;
    },
    // walk the tree (self as the root) [fn, true/false]
    walk: function(handler, childrenFirst) {
      if (!childrenFirst) {
        handler(this);
        this.children.forEach(function(child, i) {
          child.walk(handler);
        });
      } else {
        this.children.forEach(function(child, i) {
          child.walk(handler, true);
        });
        handler(this);
      }
    },
    // add element at the end of self's children [element]
    appendChild: function(element) {
      if (element && (element instanceof Element) && this.children.indexOf(element) < 0) {
        if (element.parent) {
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
    insertBefore: function(element, ref) {
      var pos;
      if (element && (element instanceof Element) && this.children.indexOf(element) < 0 && ref && (ref instanceof Element) && (pos = this.children.indexOf(ref)) >= 0) {
        if (element.parent) {
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
    removeChild: function(element) {
      var index = -1;
      if (element && (element instanceof Element)) {
        index = this.children.indexOf(element);
      } else if (typeof element === 'number') {
        index = element;
        element = this.children[index];
      } else {
        return this;
      }
      if (index >= 0) {
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
    containsPoint: function(x, y) {
      return false;
    },
    // contains a element [element]
    contains: function(element) {
      while (element) {
        if (element === this) {
          return true;
        }
        element = element.parent;
      }
      return false;
    }
  });
  // types of element [rectangle, circle, ...]
  var types = {};
  // method to extend dom element type
  var extendType = function(name, opt, base) {
    base = base ? Element.types[base] : Element;
    opt.attr = $.extend(opt.attr, base.prototype.attr, true);
    Element.types[name] = base.extend(name[0].toUpperCase() + name.slice(1), opt);
  };
  // method to extend dom element methods
  var extendMethod = function(name, method) {
    return Element.prototype[name] = method;
  };
  $.extend(Element, {
    types: {},
    extendType: extendType,
    extendMethod: extendMethod
  }, true);
  module.exports = Element;
});
define("i-canvas/0.0.2/element/rectangle-debug", [], function(require, exports, module) {
  /*
   * rectangle
   *
   * usage:
   *  doc.createElement('rectangle', {...})
   */
  var Canvas = require("i-canvas/0.0.2/core-debug");
  // simulated dom element class - rectangle
  Canvas.extendElementType('rectangle', {
    // realize rectangle-draw
    draw: function(canvas) {
      var pos = this.getPos(),
        attr = this.attr;
      if (attr.border) {
        var borderWidth = attr['border-width'];
        canvas.drawRectangle(pos.x - borderWidth, pos.y - borderWidth, attr.width + borderWidth * 2, attr.height + borderWidth * 2, attr.border);
      }
      if (attr.background) {
        canvas.drawRectangle(pos.x, pos.y, attr.width, attr.height, attr.background);
      }
      return this;
    },
    // realize rectangle-contain
    containsPoint: function(x, y) {
      var pos = this.getPos(),
        attr = this.attr,
        borderWidth = attr.border ? attr['border-width'] : 0;
      return (x >= pos.x - borderWidth && x <= pos.x + attr.width + borderWidth) && (y >= pos.y - borderWidth && y <= pos.y + attr.height + borderWidth);
    }
  });
});
define("i-canvas/0.0.2/element/circle-debug", [], function(require, exports, module) {
  /*
   * circle
   *
   * usage:
   *  doc.createElement('circle', {...})
   */
  var Canvas = require("i-canvas/0.0.2/core-debug");
  // simulated dom element class - circle
  Canvas.extendElementType('circle', {
    attr: {
      radius: 0 // size - [ number(100) ]
    },
    // realize circle-draw
    draw: function(canvas) {
      var pos = this.getPos(),
        attr = this.attr;
      if (attr.border) {
        var borderWidth = attr['border-width'];
        canvas.drawCircle(pos.x, pos.y, attr.radius + borderWidth, attr.border);
      }
      if (attr.background) {
        canvas.drawCircle(pos.x, pos.y, attr.radius, attr.background);
      }
      return this;
    },
    // realize circle-contain
    containsPoint: function(x, y) {
      var pos = this.getPos(),
        attr = this.attr,
        borderWidth = attr.border ? attr['border-width'] : 0;
      var dd = Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2),
        rr = Math.pow(attr.radius + borderWidth, 2);
      return dd <= rr;
    }
  });
});
define("i-canvas/0.0.2/plugin/movable-debug", [], function(require, exports, module) {
  /*
   * movable
   *
   * usage:
   *  element.movable()
   */
  var Canvas = require("i-canvas/0.0.2/core-debug");
  var movable = function(mode) {
    mode = mode || 'mobile';
    var offsetX = 0,
      offsetY = 0;
    var events = mode === 'mobile' ? {
      begin: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    } : {
      begin: 'mousedown',
      move: 'mousemove',
      end: 'mouseup'
    };
    var body = this.document.body,
      element = this;
    var moveWith = function(e) {
      if (mode === 'mobile') {
        e = e.targetTouches[0];
      }
      element.setAttribute({
        left: e.x - offsetX,
        top: e.y - offsetY
      });
    };
    var endBind = function(e) {
      body.un(events.move, moveWith);
      body.un(events.end, endBind);
    };
    element.on(events.begin, function(e) {
      e.stopPropagation();
      if (mode === 'mobile') {
        e = e.targetTouches[0];
      }
      offsetX = e.x - element.getAttribute('left');
      offsetY = e.y - element.getAttribute('top');
      body.on(events.move, moveWith);
      body.on(events.end, endBind);
    });
  };
  Canvas.extendElementMethod('movable', movable);
});