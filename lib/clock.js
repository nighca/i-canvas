var $ = require('./lib');
var util = require('./util');

var Clock = util.EventEmitter.extend('Clock', {
    init: function(){
        this._super.apply(this, arguments);

        this.count = 0;

        this.run();
    },

    run: function(){
        var clock = this;

        this.running = true;

        this.tick();
    },

    tick: function(){
        var clock = this;

        if(clock.running){
            clock.fire('tick', {
                count: ++clock.count
            });
        }

        window.requestAnimationFrame(function(){
            clock.tick();
        });
    }
});

module.exports = Clock;
