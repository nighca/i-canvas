/*
 * bound
 *
 * usage:
 *  element.bound(boundary, wastage) [ { x: { min: number, max: number }, y: { min: number, max: number } }, number ]
 */

var Canvas = require('../core');

var bound = function(boundary, wastage){
    var element = this;

    element.boundary = boundary || element.boundary || {};
    element.wastage = wastage || element.wastage || 0;

    if(element.status.bound){
        // do nothing
    }else{
        element.status.bound = true;

        element.on('tick', function(e){
            var range = element.getRange(),
                attr = element.attr,
                boundary = element.boundary,
                velocity = element.velocity,
                retain = 1 - element.wastage,
                overflow = 0;

            if(boundary.x){
                var minX = boundary.x.min,
                    maxX = boundary.x.max;

                if(typeof minX === 'number'){
                    if(velocity.x < 0 && (overflow = minX - range.x.min) >= 0){
                        element.setAttribute('left', attr.left + overflow * 2);
                        velocity.x = -velocity.x * retain;
                    }
                }

                if(typeof maxX === 'number'){
                    if(velocity.x > 0 && (overflow = range.x.max - maxX) >= 0){
                        element.setAttribute('left', attr.left - overflow * 2);
                        velocity.x = -velocity.x * retain;
                    }
                }
            }

            if(boundary.y){
                var minY = boundary.y.min,
                    maxY = boundary.y.max;

                if(typeof minY === 'number'){
                    if(velocity.y < 0 && (overflow = minY - range.y.min) >= 0){
                        element.setAttribute('top', attr.top + overflow * 2);
                        velocity.y = -velocity.y * retain;
                    }
                }

                if(typeof maxY === 'number'){
                    if(velocity.y > 0 && (overflow = range.y.max - maxY) >= 0){
                        element.setAttribute('top', attr.top - overflow * 2);
                        velocity.y = -velocity.y * retain;
                    }
                }
            }

        });

    }

    return this;
};

Canvas.extendElementMethod('bound', bound);
