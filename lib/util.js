/*
 * helper methods
 */

(function(window, $, undefined){
    'use strict';

    // merge sort realization
    var stableSort = function(arr, fn){
        var l = arr.length;

        switch(l){
            case 0:
            case 1:
                return arr;
            case 2:
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

    window.util = {
        stableSort: stableSort
    };

})(this, $);