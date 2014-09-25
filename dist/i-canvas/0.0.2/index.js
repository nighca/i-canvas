define("i-canvas/0.0.2/index",[],function(t,e,n){var i=t("i-canvas/0.0.2/core");t("i-canvas/0.0.2/element/rectangle"),t("i-canvas/0.0.2/element/circle"),t("i-canvas/0.0.2/element/image"),t("i-canvas/0.0.2/plugin/movable"),n.exports=i}),define("i-canvas/0.0.2/core",[],function(t,e,n){var i=t("i-canvas/0.0.2/lib/canvas"),r=t("i-canvas/0.0.2/lib/element");$.extend(i,{extendElementType:r.extendType,extendElementMethod:r.extendMethod},!0),n.exports=i}),define("i-canvas/0.0.2/lib/canvas",[],function(t,e,n){var i=t("i-canvas/0.0.2/lib/lib"),r=t("i-canvas/0.0.2/lib/util"),o=t("i-canvas/0.0.2/lib/dom"),a=r.EventEmitter.extend("Canvas",{init:function(t,e){var n=this,e=n.opt=i.extend({type:"2d",width:t.width,height:t.height,background:"#fff"},e,!0);n.dom=i(t),n.ctx=n.dom.getContext(e.type),n.document=new o({dom:t,width:e.width,height:e.height});var r;n.document.on("dom-event",function(t){["attr-modify","subtree-modify"].indexOf(t.domEvent.type)>=0&&(clearTimeout(r),r=setTimeout(function(){n.draw()},0))}),n.draw()},draw:function(){var t=this,e=t.opt,n=t.ctx;n.clearRect(0,0,e.width,e.height),this.document.getRenderQueue().forEach(function(e){e.getAttribute("visible")&&e.draw(t)})},drawRectangle:function(t,e,n,i,r){var o=this.ctx,a=o.fillStyle;o.fillStyle=r,o.fillRect(t,e,n,i),o.fillStyle=a},drawCircle:function(t,e,n,i){var r=this.ctx,o=r.fillStyle;r.fillStyle=i,r.beginPath(),r.arc(t,e,n,0,2*Math.PI,!0),r.closePath(),r.fill(),r.fillStyle=o}});a.create=function(t,e){e=i.extend({width:t.clientWidth,height:t.clientHeight},e);var n=document.createElement("canvas");return n.setAttribute("width",e.width),n.setAttribute("height",e.height),t.appendChild(n),new a(n,e)},n.exports=a}),define("i-canvas/0.0.2/lib/lib",[],function(t,e,n){"use strict";var i=Object.prototype.toString.call.bind(Object.prototype.toString),r=function(t,e){if("[object Array]"!==i(t)){for(var n in t)if(t.hasOwnProperty(n)&&e.call(this,t[n],n)===!1)return}else for(var r=0,o=t.length;o>r&&e.call(this,t[r],r)!==!1;r++);},o=function(t){if(!t)return t;var e=new t.constructor;return r(t,function(t,n){e[n]=t}),e},a=function(t,e,n){return t=(n?t:o(t))||{},r(e,function(e,n){t[n]=e}),t},s={on:HTMLElement.prototype.addEventListener,un:HTMLElement.prototype.removeEventListener,css:function(t,e){var n=this;return"[object String]"===i(t)?this.style.setProperty(t,e):r(t,function(t,e){n.css(e,t)})},show:function(){this.css("display","")},hide:function(){this.css("display","none")},find:function(t){return h(t,this)},parent:function(){return c(this.parentNode)}},c=function(t){return t?a(t,s,!0):t},h=function(t,e){return c("[object String]"===i(t)?(e||document).querySelector(t):t)},u=function(t,e){return Array.prototype.slice.call("[object String]"===i(t)?(e||document).querySelectorAll(t):t).map(c)};a(h,{type:i,forEach:r,clone:o,extend:a,$:u},!0),"undefined"!=typeof n&&n.exports?n.exports=h:a(window,{$:h,$$:u},!0)}),define("i-canvas/0.0.2/lib/util",[],function(t,e,n){"use strict";var i=t("i-canvas/0.0.2/lib/class"),r=function(t,e){var n=t.length;switch(n){case 0:case 1:return t;case 2:return e(t[0],t[1])?[t[1],t[0]]:t;default:var i=Math.floor(n/2),o=i,a=n-i,s=r(t.slice(0,i),e),c=r(t.slice(i),e);t=[];for(var h=0,u=0;o-1>=h||a-1>=u;)t.push(h>o-1?c[u++]:u>a-1?s[h++]:e(s[h],c[u])?c[u++]:s[h++]);return t}},o=i.extend("EventEmitter",{on:function(t,e){t=t.toLowerCase();var n=this.__eventGetList__();return(n[t]=n[t]||[]).push(e),this},un:function(t,e){t=t.toLowerCase();var n=this.__eventGetList__(),i=n[t];if(i){e||(n[t]=null);for(var r=[],o=0,a=i.length;a>o;o++)i[o]!==e&&r.push(i[o]);n[t]=r.length?r:null}return this},fire:function(t,e){"[object Object]"===Object.prototype.toString.call(t)&&t.type&&!e&&(e=t,t=e.type),t=t.toLowerCase();var n=this.__eventGetList__(),i=n[t];if(i)for(var r=0,o=i.length;o>r;r++)try{i[r].call(this,e)}catch(a){console.warn(a)}return this},__eventGetList__:function(){return this.__eventList__||(this.__eventList__={}),this.__eventList__}});n.exports={stableSort:r,EventEmitter:o}}),define("i-canvas/0.0.2/lib/class",[],function(require,exports,module){var initializing=!1,fnTest=/xyz/.test(function(){})?/\b_super\b/:/.*/;this.Class=function(){},Class.extend=function(className,prop){prop||(prop=className,className="Anonymous");var _super=this.prototype;initializing=!0;var prototype=new this;initializing=!1;for(var name in prop)prototype[name]="function"==typeof prop[name]&&"function"==typeof _super[name]&&fnTest.test(prop[name])?function(t,e){return function(){var n=this._super;this._super=_super[t];var i=e.apply(this,arguments);return this._super=n,i}}(name,prop[name]):prop[name];var Class=eval("(function "+className+"() {    if ( !initializing && this.init )      this.init.apply(this, arguments);  })");return Class.prototype=prototype,Class.prototype.constructor=Class,Class.extend=arguments.callee,Class},module.exports=Class}),define("i-canvas/0.0.2/lib/dom",[],function(t,e,n){var i=t("i-canvas/0.0.2/lib/class"),r=t("i-canvas/0.0.2/lib/util"),o=t("i-canvas/0.0.2/lib/lib"),a=t("i-canvas/0.0.2/lib/element"),s=i.extend("DomEvent",{prevented:!1,stopped:!1,init:function(t){o.extend(this,t,!0)},preventDefault:function(){this.prevented=!0},stopPropagation:function(){this.stopped=!0}}),c=r.EventEmitter.extend("DomManager",{init:function(t){this.dom=t.dom,this.width=t.width,this.height=t.height,this.clientWidth=this.dom.clientWidth,this.clientHeight=this.dom.clientHeight,this.scaleWidth=this.width/this.clientWidth,this.scaleHeight=this.height/this.clientHeight,this.body=this.createElement("rectangle",{width:this.width,height:this.height}),this.delegateEvents()},createElement:function(t,e){return a.types[t]?new a.types[t](this,e):null},fireDomEvent:function(t,e){var n=new s(o.extend(e,{type:t},!0)),i=n.target;if(i.fire(t,n),["attr-modify","mouseenter","mouseleave"].indexOf(t)<0)for(;i.parent&&!n.stopped;)(i=i.parent).fire(t,n);this.fire("dom-event",{domEvent:n})},getRenderQueue:function(){var t=[];this.body.walk(function(e){e.__cache__.zIndex=null,t.push(e)});var e=function(t){return null!==t.__cache__.zIndex?t.__cache__.zIndex:t.__cache__.zIndex=t.getZIndex()};return t=r.stableSort(t,function(t,n){return e(t)>e(n)})},delegateEvents:function(){var t=this,e=t.dom;["click","drag","drop","mousedown","mousemove","mouseup"].forEach(function(n){e.on(n,function(e){for(var i,r=e.offsetX*t.scaleWidth,o=e.offsetY*t.scaleHeight,a=e,s=t.getRenderQueue(),c=s.length-1;c>=0;c--)if(s[c].containsPoint(r,o)){i=s[c];break}i&&t.fireDomEvent(n,{x:r,y:o,origin:a,target:i})})}),["touchstart","touchmove","touchend","touchcancel"].forEach(function(n){e.on(n,function(i){var r={x:0,y:0,origin:i,target:e},a=e.offsetLeft,s=e.offsetTop;["touches","targetTouches","changedTouches"].forEach(function(e){r[e]=Array.prototype.slice.call(i[e]).map(function(e){for(var n,i=(e.clientX-a)*t.scaleWidth,r=(e.clientY-s)*t.scaleHeight,o=e,c=t.getRenderQueue(),h=c.length-1;h>=0;h--)if(c[h].containsPoint(i,r)){n=c[h];break}return{x:i,y:r,origin:o,target:n}})}),r.changedTouches.forEach(function(e){e.target&&t.fireDomEvent(n,o.extend(r,{target:e.target}))})})});var n={};["mouseenter","mousemove","mouseleave"].forEach(function(i){e.on(i,function(e){for(var i,r=e.offsetX*t.scaleWidth,o=e.offsetY*t.scaleHeight,a=e,s=t.getRenderQueue(),c=s.length-1;c>=0;c--)if(s[c].containsPoint(r,o)){i=s[c];break}if(i!==n.target){for(var h=n.target;h&&!h.contains(i);)h=h.parent;for(var u=n.target;u!==h;)t.fireDomEvent("mouseleave",{x:r,y:o,origin:a,target:u}),u=u.parent;for(u=i;u!==h;)t.fireDomEvent("mouseenter",{x:r,y:o,origin:a,target:u}),u=u.parent}n={e:e,target:i}})})}});n.exports=c}),define("i-canvas/0.0.2/lib/element",[],function(t,e,n){var i=t("i-canvas/0.0.2/lib/util"),r=t("i-canvas/0.0.2/lib/lib"),o=i.EventEmitter.extend("Element",{attr:{top:0,left:0,width:0,height:0,background:null,position:"relative","z-index":null,visible:!0,"border-width":0,border:null},init:function(t,e){this.document=t,this.attr=r.extend(this.attr,e),this.children=[],this.__cache__={}},getAttribute:function(t){return this.attr[t]},setAttribute:function(t,e){if("[object String]"===r.type(t))this.attr[t]=e,this.document.fireDomEvent("attr-modify",{target:this,attr:t,val:e});else{var n=this;r.forEach(t,function(t,e){n.setAttribute(e,t)})}return this},show:function(){this.setAttribute("visible",!0)},hide:function(){this.setAttribute("visible",!1)},getPos:function(){var t=this.attr;switch(t.position){case"absolute":return{x:t.left,y:t.top};case"relative":var e=this.parent?this.parent.getPos():{x:0,y:0};return{x:e.x+t.left,y:e.y+t.top};default:return{x:0,y:0}}},getZIndex:function(){return null===this.attr["z-index"]?this.parent?this.parent.getZIndex():0:this.attr["z-index"]},draw:function(){return this},walk:function(t,e){e?(this.children.forEach(function(e){e.walk(t,!0)}),t(this)):(t(this),this.children.forEach(function(e){e.walk(t)}))},appendChild:function(t){return t&&t instanceof o&&this.children.indexOf(t)<0&&(t.parent&&t.parent.removeChild(t),this.children.push(t),t.parent=this,this.document.fireDomEvent("subtree-modify",{target:this,add:t})),this},insertBefore:function(t,e){var n;return t&&t instanceof o&&this.children.indexOf(t)<0&&e&&e instanceof o&&(n=this.children.indexOf(e))>=0&&(t.parent&&t.parent.removeChild(t),this.children.splice(n-1,0,t),t.parent=this,this.document.fireDomEvent("subtree-modify",{target:this,add:t})),this},removeChild:function(t){var e=-1;if(t&&t instanceof o)e=this.children.indexOf(t);else{if("number"!=typeof t)return this;e=t,t=this.children[e]}return e>=0&&(this.children.splice(e,1),t.parent=null,this.document.fireDomEvent("subtree-modify",{target:this,remove:t})),this},containsPoint:function(){return!1},contains:function(t){for(;t;){if(t===this)return!0;t=t.parent}return!1}}),a=function(t,e,n){n=n?o.types[n]:o,e.attr=r.extend(e.attr,n.prototype.attr,!0),o.types[t]=n.extend(t[0].toUpperCase()+t.slice(1),e)},s=function(t,e){return o.prototype[t]=e};r.extend(o,{types:{},extendType:a,extendMethod:s},!0),n.exports=o}),define("i-canvas/0.0.2/element/rectangle",[],function(t){var e=t("i-canvas/0.0.2/core");e.extendElementType("rectangle",{draw:function(t){var e=this.getPos(),n=this.attr;if(n.border){var i=n["border-width"];t.drawRectangle(e.x-i,e.y-i,n.width+2*i,n.height+2*i,n.border),t.drawRectangle(e.x,e.y,n.width,n.height,t.opt.background)}return n.background&&t.drawRectangle(e.x,e.y,n.width,n.height,n.background),this},containsPoint:function(t,e){var n=this.getPos(),i=this.attr,r=i.border?i["border-width"]:0;return t>=n.x-r&&t<=n.x+i.width+r&&e>=n.y-r&&e<=n.y+i.height+r}})}),define("i-canvas/0.0.2/element/circle",[],function(t){var e=t("i-canvas/0.0.2/core");e.extendElementType("circle",{attr:{radius:0},draw:function(t){var e=this.getPos(),n=this.attr;if(n.border){var i=n["border-width"];t.drawCircle(e.x,e.y,n.radius+i,n.border),t.drawCircle(e.x,e.y,n.radius,t.opt.background)}return n.background&&t.drawCircle(e.x,e.y,n.radius,n.background),this},containsPoint:function(t,e){var n=this.getPos(),i=this.attr,r=i.border?i["border-width"]:0,o=Math.pow(t-n.x,2)+Math.pow(e-n.y,2),a=Math.pow(i.radius+r,2);return a>=o}})}),define("i-canvas/0.0.2/element/image",[],function(t){var e=t("i-canvas/0.0.2/core"),n=function(t){return t.complete?"undefined"!=typeof t.naturalWidth&&0===t.naturalWidth?!1:!0:!1};e.extendElementType("image",{attr:{url:null,width:"auto",height:"auto"},init:function(){this._super.apply(this,arguments),this.createImage()},createImage:function(){var t=new Image;return t.src=this.attr.url,this.image=t},drawImage:function(t,e){var n=this.getPos(),i=this.attr;t.ctx.drawImage(e,n.x,n.y,i.width,i.height)},draw:function(t){var e=(this.getPos(),this.attr);this._super(t);var i=this.image.src!==e.url?this.createImage():this.image;if(n(i))this.drawImage(t,i);else{var r=this;i.addEventListener("load",function(){r.drawImage(t,i)})}return this}},"rectangle")}),define("i-canvas/0.0.2/plugin/movable",[],function(t){var e=t("i-canvas/0.0.2/core"),n=function(t){t=t||"mobile";var e=0,n=0,i="mobile"===t?{begin:"touchstart",move:"touchmove",end:"touchend"}:{begin:"mousedown",move:"mousemove",end:"mouseup"},r=this.document.body,o=this,a=function(i){"mobile"===t&&(i=i.targetTouches[0]),o.setAttribute({left:i.x-e,top:i.y-n})},s=function(){r.un(i.move,a),r.un(i.end,s)};o.on(i.begin,function(c){c.stopPropagation(),"mobile"===t&&(c=c.targetTouches[0]),e=c.x-o.getAttribute("left"),n=c.y-o.getAttribute("top"),r.on(i.move,a),r.on(i.end,s)})};e.extendElementMethod("movable",n)});