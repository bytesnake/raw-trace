var dns = require('dns');
var net = require('net'); // isIP( ip )
var raw = require('raw-socket');

function rand() {
	return (Math.random()*16|0);
}

function GeneratePacket(ident_length) {
	var buf = new Buffer(5+ident_length);
	buf.fill(0x00);

	// Echo request
	buf[0] = 0x08;

	// Identifier
	while(ident_length--) {
		buf.writeInt8(rand(), 5+ident_length, true);
	}
	
	return buf;
}

function SetTTL(buf, ttl) {
	buf.writeInt8(ttl, 4, true);
	
	// Reset checksum
	buf[2] = 0x00; buf[3] = 0x00;
	raw.writeChecksum(buf, 2, raw.createChecksum(buf));
}

function CheckMatch(a,b,c,d) {
	while(c--) {
		if(a[c] == b[d]) {
			return (d > 0) ? CheckMatch(a, b, c, d-1) : c;
		}
	}

	return 0;
}


function traceroute(dest, timeout, interval, cb) {
	var socket = raw.createSocket({ protocol: raw.Protocol.ICMP });
	var packet = GeneratePacket(3);
	var sended_packets = [];
	var timeout_loop;

	function end() {
		clearInterval(loop);
		clearTimeout(timeout_loop);
		socket.close();
	}

	socket.on('message', function(buffer, source) {
		var pos = CheckMatch(buffer, packet.slice(5), buffer.length, packet.length-6);
		if(pos > 0) {
			var ttl = buffer[pos-1];
			if(ttl > 0 && (ttl-1) in sended_packets) {
				var time = process.hrtime(sended_packets[ttl-1]);
				cb(ttl-1, source, time[0]*1000+time[1]/1000/1000);

				clearTimeout(timeout_loop);
				timeout_loop = setTimeout(function() {
					end();
				}, timeout);

				if(source == dest) {
					end();
				}
			}

		}
	});

	var ttl_level = 1;
	var loop = setInterval(function() {
		socket.setOption( raw.SocketLevel.IPPROTO_IP,
				  raw.SocketOption.IP_TTL,
				  ttl_level );

		SetTTL(packet, ttl_level);

		socket.send(packet, 0, packet.length, dest, function(err, bytes) {
			if(err) throw err;
		});

		sended_packets[ttl_level-1] = process.hrtime();

		if(ttl_level < 255) ttl_level ++;
		else clearInterval(loop);
	}, interval);
}

module.exports = function(dest, timeout, interval, cb) {
	if(net.isIP(dest) == 0) {
		dns.resolve4(dest, function(err, addresses) {
			if(err) console.log("Cannot resolve host!");
			else traceroute(addresses[0], timeout, interval, cb);
		});
	}
	else {
		traceroute(dest, timeout, interval, cb);
	}
};


