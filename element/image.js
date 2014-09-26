/*
 * image
 *
 * usage:
 *  doc.createElement('image', {...})
 */

var Canvas = require('../core');

// http://blog.sajithmr.me/javascript-check-an-image-is-loaded-or-not
var IsImageOk = function(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
        return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.

    if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
        return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
};

// simulated dom element class - image
Canvas.extendElementType('image', {
    attr: {
        url: null,                       // [ url('http://...') ]
        width: 'auto',
        height: 'auto'
    },
    init: function(){
        this._super.apply(this, arguments);

        this.createImage();
    },
    createImage: function(){
        var img = new Image();
        img.src = this.attr.url;

        return this.image = img;
    },
    // draw a image instance
    drawImage: function(canvas, img){
        var pos = this.getPos(),
            attr = this.attr;

        canvas.ctx.drawImage(img, pos.x, pos.y, attr.width, attr.height);
    },
    // realize image-draw
    draw: function(canvas){
        var pos = this.getPos(),
            attr = this.attr;

        // rectangle draw
        this._super.apply(this, arguments);

        var img = this.image.src !== attr.url ?
            this.createImage() :
            this.image;

        if(IsImageOk(img)){
            this.drawImage(canvas, img);
        }else{
            var element = this;
            img.addEventListener('load', function(){
                element.drawImage(canvas, img);
            });
        }

        return this;
    }
}, 'rectangle');