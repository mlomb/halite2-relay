const fs = require('fs');
const WebSocket = require('ws');
const child_process = require('child_process');
require('./common');

var bot_command_filename = "mybot_command.txt";

console.log("=======================");
console.log("==== Halite2-Relay ====");
console.log("======= Server ========");
console.log("=======================");

console.log("Make sure that the halite executable is next to this file!");

var relay_command = "node relay.js";
var roomServer;
var relayServer;
var inGame = false;

// Room size
var roomSize;
do {
	console.log("Select the room size (2 or 4): ");
	roomSize = readInt(false);
} while(roomSize != 2 && roomSize != 4);

// Port
console.log("Select port (leave empty for default " + default_port + "): ");
var port = readInt(true);
if(port == 0)
	port = default_port;

/* Server functions */	
function print(message){ // print to all users
	console.log(message);
	
	var data = JSON.stringify({
		"type": "print",
		"message": message
	});
	
	roomServer.clients.forEach(function(roomClient) {
		roomClient.sendSafe(data);
	});
}

function startGame() {
	inGame = true;
	console.log("Starting game...");
	
	console.log("Starting internal relay server...");
	relayServer = new WebSocket.Server({ port: relay_internal_port });
	
	var relayId = 0;
	relayServer.on('connection', function(relayClient) {
		relayClient.relay = relayId++;
		relayClient.on('message', function(message) {
			roomServer.clients.forEach(function(roomClient) {
				if(roomClient.relay == relayClient.relay){
					roomClient.sendSafe(JSON.stringify({
						"type": "bot_in",
						"data": message
					}));
				}
			});
		});
	});
	
	console.log("Starting halite executable...")
	var players = roomSize == 2 ? ["-t", relay_command, relay_command] : ["-t", relay_command, relay_command, relay_command, relay_command];
	var prc = child_process.spawn('halite', players);

	var replayFile = "";
	
	prc.stdout.setEncoding('utf8');
	prc.stdout.on('data', function (data) {
		var str = data.toString()
		var lines = str.split(/(\r?\n)/g);
		var txt = lines.join("");
		
		if(txt.indexOf("Opening a file at") !== -1){
			var index = txt.indexOf("replay-");
			replayFile = txt.substring(index, index + 55) + ".hlt";
		}
		print(lines.join(""));
	});

	prc.on('exit', function (code) {
		print('Halite executable exit code ' + code);
		relayServer.close();
		updateUsers();
		print("Next game will start in 10 seconds");
		if(replayFile.length > 0) {
			print("----- Saved replay as: " + replayFile);
			var contents = fs.readFileSync(replayFile).toString("base64");
			roomServer.clients.forEach(function(roomClient) {
				roomClient.sendSafe(JSON.stringify({
					"type": "replay",
					"filename": replayFile,
					"data": contents
				}));
			});
		}
		setTimeout(function(){
			inGame = false;
			updateUsers();
		}, 10000);
	});

	var i = 0;
	roomServer.clients.forEach(function(roomClient) {
		roomClient.relay = i++;
		roomClient.sendSafe(JSON.stringify({
			"type": "start"
		}));
	});
}

function updateUsers(){
	var users = 0;
	roomServer.clients.forEach(function(roomClient) {
		if (roomClient.readyState === WebSocket.OPEN) {
			users++;
		}
	});
	
	print("Users in the room " + users + "/" + roomSize);

	if(users == roomSize)
		print("The match will start shortly");
	else if(users > roomSize)
		print("There are too many players in this room!");
	else
		print("Waiting for players...");
	
	if(inGame)
		return;
	
	if(users == roomSize){
		startGame();
	}
}

roomServer = new WebSocket.Server({ port: port });

console.log("Hosting " + roomSize + "p room at port " + port + "...");

roomServer.on('connection', function(roomClient) {
	roomClient.relay = -1;
	
	roomClient.sendSafe = function(data){
		if (roomClient.readyState === WebSocket.OPEN) {
			roomClient.send(data);
		}
	}

	roomClient.on('message', function(message) {
		var json = JSON.parse(message);
		
		switch(json.type){
			case "bot_out":
			relayServer.clients.forEach(function(relayClient) {
				if(relayClient.relay == roomClient.relay){
					relayClient.send(json.data);
				}
			});
			break;
			default:
			console.log("Unknown message received: " + message);
			break;
		}
	});
	
	roomClient.on('close', updateUsers);
	
	updateUsers();
});