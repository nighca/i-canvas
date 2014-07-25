/*
 * core
 * exports Canvas core
 */

var Canvas = require('./lib/canvas');
var Element = require('./lib/element');

// export methods
$.extend(Canvas, {
    extendElementType: Element.extendType,
    extendElementMethod: Element.extendMethod
}, true);

module.exports = Canvas;
