/*
 * move
 *
 * usage:
 *  element.move(velocity) [{x:number, y:number}]
 */

var Canvas = require('../core');

var move = function(velocity){
    var element = this;

    element.velocity = velocity || element.velocity || { x: 0, y: 0 };

    if(element.status.move){
        // do nothing
    }else{
        element.status.move = true;

        // moves by velocity per tick
        element.on('tick', function(info){
            var v = element.velocity;
            element.setAttribute({
                top: element.getAttribute('top') + v.y,
                left: element.getAttribute('left') + v.x
            });
        });
    }

    return this;
};

Canvas.extendElementMethod('move', move);
