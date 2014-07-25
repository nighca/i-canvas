/*
 * core
 * exports Canvas (with plugins)
 */

var Canvas = require('./core');

require('./plugin/movable');

module.exports = Canvas;