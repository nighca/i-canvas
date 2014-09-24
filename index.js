/*
 * canvas
 * exports Canvas
 */

// core
var Canvas = require('./core');

// element types
require('./element/rectangle');
require('./element/circle');

// plugins
require('./plugin/movable');


module.exports = Canvas;