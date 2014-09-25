/*
 * circle
 *
 * usage:
 *  doc.createElement('circle', {...})
 */

var Canvas = require('../core');

// simulated dom element class - circle
Canvas.extendElementType('circle', {
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
            canvas.drawCircle(pos.x, pos.y, attr.radius, canvas.opt.background);
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
