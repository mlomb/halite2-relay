const fs = require('fs');
const WebSocket = require('ws');
const child_process = require('child_process');
require('./common');

var bot_command_filename = "mybot_command.txt";

console.log("=======================");
console.log("==== Halite2-Relay ====");
console.log("======= Client ========");
console.log("=======================");

// load the bot command
var bot_command;
try {
	bot_command = fs.readFileSync(bot_command_filename, 'utf8')
	console.log("Your bot's command is '" + bot_command + "'");
} catch (err) {
	console.log("Make sure you have set your bot's command inside " + bot_command_filename);
	process.exit(0);
}

console.log("Host IP: ");
var ip = readString();
console.log("Host port (leave empty for default " + default_port + "): ");
var port = readInt(true);
if(port == 0)
	port = default_port;

var ws_connect = 'ws://' + ip + ":" + port;
console.log("Connecting to " + ws_connect + "...");

const ws = new WebSocket(ws_connect);
var gameProcess;

function send(data) {
	ws.send(JSON.stringify(data));
}

ws.on('open', function() {
	console.log("Connected!");
});

ws.on('message', function(message) {
	var json = JSON.parse(message);
	
	switch(json.type){
		case "print":
		console.log(json.message);
		break;
		case "replay": // can be dangerous :(
		var buff = new Buffer(json.data, 'base64');
		fs.writeFile(json.filename, buff,  "binary",function(err) {
			if(err) {
				console.log(err);
			}
		});
		break;
		case "start":
		
		console.log("Starting bot...");
		gameProcess = child_process.exec(bot_command, { shell: true });

		gameProcess.stdin.setEncoding('utf-8');
		gameProcess.stdout.setEncoding('utf8');
		gameProcess.stdout.on('data', function (data) {
			var str = data.toString()
			var lines = str.split(/(\r?\n)/g);
			send({
				"type": "bot_out",
				"data": lines.join("")
			});
		});

		gameProcess.on('close', function (code) {
			print('MyBot exit code ' + code);
		});
		
		break;
		case "bot_in":
		gameProcess.stdin.write(json.data + "\r\n");
		break;
	}
});
