# Demo

---

## Normal usage

````javascript
seajs.config({
  	base: "../dist/",
  	alias: {
    	"i-canvas": "i-canvas/0.0.1/index-debug"
  	}
})

seajs.use("i-canvas", function(Canvas){
	// ...
});
````
