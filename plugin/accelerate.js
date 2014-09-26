/*
 * accelerate
 *
 * usage:
 *  element.accelerate(acceleration) [{x:number, y:number}]
 */

var Canvas = require('../core');

var accelerate = function(acceleration){
    var element = this;
    
    element.acceleration = acceleration || element.acceleration || { x: 0, y: 0 };

    if(element.status.accelerate){
        // do nothing
    }else{
        element.status.accelerate = true;

        element.move();

        element.on('tick', function(info){
            var v = element.velocity,
                a = element.acceleration;

            element.velocity = {
                x: v.x - a.x,
                y: v.y - a.y
            };
        });
    }

    return this;
};

Canvas.extendElementMethod('accelerate', accelerate);
