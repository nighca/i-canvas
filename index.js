/*
 * canvas
 * exports Canvas
 */

// core
var Canvas = require('./core');

// element types
require('./element/rectangle');
require('./element/circle');
require('./element/image');

// plugins
require('./plugin/draggable');

module.exports = Canvas;