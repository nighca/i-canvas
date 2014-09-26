/*
 * friction
 *
 * usage:
 *  element.friction(ratio) [number]
 */

var Canvas = require('../core');

var absolute = function(n){
    return n >= 0 ? n : -n;
};

var friction = function(ratio){
    var element = this;

    element.frictionRatio = ratio || element.frictionRatio || 0;

    if(element.status.friction){
        // do nothing
    }else{
        element.status.friction = true;

        element.on('tick', function(info){
            var v = element.velocity;

            if(v.x || v.y){
                // use inaccuracy algoritm temporarily
                var vv = absolute(v.x) + absolute(v.y),
                    rv = element.frictionRatio,
                    ratio = {
                    x: (v.x / vv) * rv,
                    y: (v.y / vv) * rv
                };

                var newV = {
                    x: v.x - ratio.x,
                    y: v.y - ratio.y
                };

                if(
                    v.x > 0 && newV.x < 0 ||
                    v.x < 0 && newV.x > 0
                ){
                    newV.x = 0;
                    newV.y = 0;
                }

                element.velocity = newV;
            }
        });
    }

    return this;
};

Canvas.extendElementMethod('friction', friction);
