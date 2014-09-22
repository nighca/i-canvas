/*
 * movable
 *
 * usage:
 *  element.movable()
 */

var Canvas = require('../core');

var movable = function(){
    var offsetX = 0,
        offsetY = 0;

    var win = $(window),
        element = this;

    var moveWith = function(e){
        element.setAttribute({
            left: e.offsetX - offsetX,
            top: e.offsetY - offsetY
        });
    };

    var endBind = function(e) {
        win.un('mousemove', moveWith);
        win.un('mouseup', endBind);
    };

    element.on('mousedown', function(e) {
        e.stopPropagation();

        offsetX = e.x - element.getAttribute('left');
        offsetY = e.y - element.getAttribute('top');

        win.on('mousemove', moveWith);
        win.on('mouseup', endBind);
    });
};

Canvas.extendElementMethod('movable', movable);
