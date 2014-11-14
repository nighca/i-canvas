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
            canvas.drawRectangle(pos.x, pos.y, attr.width, attr.height, canvas.opt.background);
        }

        if(attr.background){
            canvas.drawRectangle(pos.x, pos.y, attr.width, attr.height, attr.background);
        }

        return this;
    },
    // get range
    getRange: function(){
        var pos = this.getPos(),
            attr = this.attr,
            borderWidth = attr.border ? attr['border-width'] : 0;

        return {
            x: { min: pos.x - borderWidth, max: pos.x + attr.width + borderWidth },
            y: { min: pos.y - borderWidth, max: pos.y + attr.height + borderWidth }
        };
    },
    // realize rectangle-contain
    containsPoint: function(x, y){
        var range = this.getRange();
        return (x >= range.x.min && x <= range.x.max) &&
            (y >= range.y.min && y <= range.y.max);
    }
});