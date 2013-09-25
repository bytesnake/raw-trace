var trace = require('../index.js');

if(process.argv.length == 2) {
	console.log("usage: node ./trace.js <host>");
	process.exit(0);
}

trace(process.argv[2], 5000, 20, function(id, host, dt) {
	console.log(id+": "+host+" in " + dt+"ms");
});
