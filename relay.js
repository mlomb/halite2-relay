const readline = require('readline');
const fs = require('fs');
const WebSocket = require('ws');
require('./common');

process.stdout.setEncoding('utf-8');

var buffer = [];

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', function(line){
	buffer.push(line);
});


var ws_connect = 'ws://127.0.0.1:' + relay_internal_port;

const ws = new WebSocket(ws_connect);

ws.on('message', function(message) {
	process.stdout.write(message);
	rl.question('', function(line){
		ws.send(line);
	});
});

ws.on('open', function() {
	setTimeout(function() {
		buffer.forEach(function(line){
			ws.send(line);
		});
		buffer = [];
	}, 200);
});
