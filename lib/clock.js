var $ = require('./lib');
var util = require('./util');

var Clock = util.EventEmitter.extend('Clock', {
    init: function(fps){
        this._super.apply(this, arguments);

        this.fps = fps;

        this.run();
    },

    run: function(){
        var clock = this,
            interval = 1000 / this.fps;

        clock.count = 0;

        this.timer = setInterval(function(){
            clock.fire('tick', {
                count: ++clock.count
            });
        }, interval);
    }
});

module.exports = Clock;
