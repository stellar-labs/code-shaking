const codeShaking = require("../lib/index");

codeShaking("https://vuejs.org/", "index.css").then(function(response) {
	console.log(response);
});
