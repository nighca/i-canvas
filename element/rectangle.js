/*
 * rectangle
 *
 * usage:
 *  doc.createElement('rectangle', {...})
 */

var Canvas = require('../core');

// simulated dom element class - rectangle
Canvas.extendElementType('rectangle', {
    // realize rectangle-draw
    draw: function(canvas){
        var pos = this.getPos(),
            attr = this.attr;

        if(attr.border){
            var borderWidth = attr['border-width'];
            canvas.drawRectangle(pos.x - borderWidth, pos.y - borderWidth, attr.width + borderWidth * 2, attr.height + borderWidth * 2, attr.border);
        }

        if(attr.background){
            canvas.drawRectangle(pos.x, pos.y, attr.width, attr.height, attr.background);
        }

        return this;
    },
    // realize rectangle-contain
    containsPoint: function(x, y){
        var pos = this.getPos(),
            attr = this.attr,
            borderWidth = attr.border ? attr['border-width'] : 0;
        return (x >= pos.x - borderWidth && x <= pos.x + attr.width + borderWidth) &&
            (y >= pos.y - borderWidth && y <= pos.y + attr.height + borderWidth);
    }
});