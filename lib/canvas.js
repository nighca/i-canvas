var $ = require('./lib');
var util = require('./util');
var DomManager = require('./dom');
var Clock = require('./clock');

// simulated dom manager class
var Canvas = util.EventEmitter.extend('Canvas', {

    init: function(dom, opt){
        this._super.apply(this, arguments);

        var canvas = this;

        // options
        var opt = canvas.opt = $.extend({
            type: '2d',
            width: dom.width,
            height: dom.height,
            background: '#fff',
            fps: 60
        }, opt, true);

        // real dom
        canvas.dom = $(dom);

        // canvas-ctx
        canvas.ctx = canvas.dom.getContext(opt.type);

        // simulated document
        canvas.document = new DomManager({
            dom: dom,
            width: opt.width,
            height: opt.height
        });

        // marke while tree modify
        canvas.needRedraw = true;

        canvas.document.on('dom-event', function(e){
            if(['attr-modify', 'subtree-modify'].indexOf(e.domEvent.type) >= 0){
                canvas.needRedraw = true;
            }
        });

        // clock
        var clock = canvas.clock = new Clock(opt.fps);

        clock.on('tick', function(info){
            if(canvas.needRedraw){
                canvas.draw();
            }
        });

    },

    // draw all elements on the canvas
    draw: function(){
        var canvas = this,
            opt = canvas.opt,
            ctx = canvas.ctx;

        // clean canvas
        ctx.clearRect(0, 0, opt.width, opt.height)

        // get the render sequence & render one by one
        this.document.getRenderQueue().forEach(function(element){
            element.draw(canvas);
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

Canvas.create = function(container, opt){
    opt = $.extend({
        width: container.clientWidth,
        height: container.clientHeight
    }, opt);

    var dom = document.createElement('canvas');

    dom.setAttribute('width', opt.width);
    dom.setAttribute('height', opt.height);

    container.appendChild(dom);

    return new Canvas(dom, opt)
};

module.exports = Canvas;