/*
 * draggable
 *
 * usage:
 *  element.draggable(mode) ['mobile'(default)/'pc']
 */

var Canvas = require('../core');

var draggable = function(mode){
    mode = mode || 'mobile';

    if(this.status.draggable){
        // do nothing
    }else{
        this.status.draggable = true;

        var offsetX = 0,
            offsetY = 0;

        var events = mode === 'mobile' ?
            {
                begin: 'touchstart',
                move: 'touchmove',
                end: 'touchend'
            } :
            {
                begin: 'mousedown',
                move: 'mousemove',
                end: 'mouseup'
            };

        var body = this.document.body,
            element = this;

        var moveWith = function(e){
            if(mode === 'mobile'){
                e = e.targetTouches[0];
            }

            element.setAttribute({
                left: e.x - offsetX,
                top: e.y - offsetY
            });
        };

        var endBind = function(e) {
            body.un(events.move, moveWith);
            body.un(events.end, endBind);

            element.fire('drag-end');
        };

        element.on(events.begin, function(e) {
            e.stopPropagation();

            if(mode === 'mobile'){
                e = e.targetTouches[0];
            }

            offsetX = e.x - element.getAttribute('left');
            offsetY = e.y - element.getAttribute('top');

            body.on(events.move, moveWith);
            body.on(events.end, endBind);

            element.fire('drag-begin');
        });

    }

    return this;
};

Canvas.extendElementMethod('draggable', draggable);
