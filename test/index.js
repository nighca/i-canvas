define(function(require, exports, module){

var Canvas = require('i-canvas');

var canvas = new Canvas($('#canvas'), '2d'),
    doc = canvas.document,
    body = doc.body;

var rec1 = doc.createElement('rectangle', {
    top: 100,
    left: 100,
    width: 100,
    height: 100,
    background: 'yellow',
    border: 'blue',
    'border-width': 5
});

var circle1 = doc.createElement('circle', {
    top: 300,
    left: 300,
    radius: 30,
    background: 'blue',
    border: 'yellow',
    'border-width': 10
});

var circle2 = doc.createElement('circle', {
    top: 50,
    left: 50,
    radius: 20,
    background: 'green',
    position: 'relative',
    'z-index': 10
});

body.appendChild(rec1);
body.appendChild(circle1);
rec1.appendChild(circle2);

circle1.movable();
circle2.movable();
rec1.movable();

});