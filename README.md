Interactive-canvas
==================

## About

Lib for generating \& operating objects on canvas.

## Features

* DOM-like API

* Powerful plugins

* Easy to extend

* Lightweight


## Install

```
$ bower install i-canvas --save
```

## Usage

```js
var Canvas = require('i-canvas');

var canvas = Canvas.create($('#container')),
	doc = canvas.document,
	body = doc.body;

var rec = doc.createElement('rectangle', {
	top: 100,
	left: 100,
	width: 100,
	height: 100,
	background: 'yellow',
	border: 'blue',
	'border-width': 5
});

body.appendChild(rec);
```

## Api

...
