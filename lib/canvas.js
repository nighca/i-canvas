var $ = require('./lib');
var util = require('./util');
var DomManager = require('./dom');

// simulated dom manager class
var Canvas = util.EventEmitter.extend('Canvas', {
    init: function(dom, opt){
        var canvas = this;

        // options
        var opt = canvas.opt = $.extend({
            type: '2d',
            width: dom.width,
            height: dom.height,
            background: '#fff'
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