(function(window, $, Class, util, Canvas, undefined){
	var canvas = $('#canvas');

	/*canvas.on('mouseenter', function(e){
		console.log(e);
	});

	canvas.on('mouseleave', function(e){
		console.log(e);
	});*/

	var canvas = new Canvas(canvas, '2d');

	var doc = canvas.document,
		body = doc.body;

})(this, $, Class, util, Canvas);
