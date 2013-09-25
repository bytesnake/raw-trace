# raw-trace

trace a route using ICMP echo request packets

# methods

``` js
var trace = require('raw-trace')
```

## trace(host, timeout, interval, cb)

Trace the route to a host. Packets will be sent in the defined interval (in milliseconds). If the given timeout is elapsed, the trace will be aborted.
On each founded router the cb with the parameters "id, host, dt" is called.

# example

``` js
var trace = require('raw-trace');

trace('npmjs.org', 5000/*ms*/, 20/*ms*/, function(id, host, dt) {
	console.log(id+": "+host+" in "+dt+"ms");
});
```

## license

BSD-2
