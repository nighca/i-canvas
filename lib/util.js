/*
 * helper methods
 */

(function(window, $, Class, undefined){
    'use strict';

    // merge sort realization
    // tips: array.prototype.sort is stable in some browsers(e.g. firefox) while unstable in some others(e.g. chrome)
    //       such result is not (maybe also will not be) ensured
    var stableSort = function(arr, fn){
        var l = arr.length;

        switch(l){
            case 0:
            case 1:
                return arr;
            case 2:
                // faster than call recursively
                return fn(arr[0], arr[1]) ? [arr[1], arr[0]] : arr;
            default:
                var pos = Math.floor(l / 2),
                    l1 = pos,
                    l2 = l - pos,
                    arr1 = stableSort(arr.slice(0, pos), fn),
                    arr2 = stableSort(arr.slice(pos), fn);

                arr = [];

                for(var i = 0, j = 0; i <= l1 - 1 || j <= l2 - 1;){
                    if(i > l1 - 1){
                        arr.push(arr2[j++]);
                    }else if(j > l2 - 1){
                        arr.push(arr1[i++]);
                    }else{
                        if(fn(arr1[i], arr2[j])){
                            arr.push(arr2[j++]);
                        }else{
                            arr.push(arr1[i++]);
                        }
                    }
                }

                return arr;
        }
    };

    // event emitter class
    var EventEmitter = Class.extend('EventEmitter', {
        on: function(name, handler){
            name = name.toLowerCase();

            var list = this.__eventGetList__();

            (list[name] = list[name] || []).push(handler);

            return this;
        },
        un: function(name, handler){
            name = name.toLowerCase();
            var list = this.__eventGetList__(),
                handlers = list[name];

            if(handlers){
                if(!handler){
                    list[name] = null;
                }

                var remaining = [];

                for(var i = 0, len = handlers.length; i < len; i++){
                    if(handlers[i] !== handler){
                        remaining.push(handlers[i]);
                    }
                }

                list[name] = remaining.length ? remaining : null;
            }

            return this;
        },
        fire: function(name, data){
            if(Object.prototype.toString.call(name) === '[object Object]' && name.type && !data){
                data = name;
                name = data.type;
            }
            name = name.toLowerCase();

            var list = this.__eventGetList__(),
                handlers = list[name];

            if(handlers){
                for(var i = 0, len = handlers.length; i < len; i++){
                    try{
                        handlers[i].call(this, data);
                    }catch(e){
                        console.warn(e);
                    }
                }
            }

            return this;
        },
        __eventGetList__: function(){
            if(!this.__eventList__){
                this.__eventList__ = {};
            }

            return this.__eventList__;
        }
    });

    // export
    window.util = {
        stableSort: stableSort,
        EventEmitter: EventEmitter
    };

})(this, $, Class);