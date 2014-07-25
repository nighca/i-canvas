var util = require('./util');
var DomManager = require('./dom');

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

module.exports = Canvas;