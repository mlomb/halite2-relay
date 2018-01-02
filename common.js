(function () {
	const readlineSync = require('readline-sync');
	default_port = 8080;
	relay_internal_port = 8081;

	/* Input functions */
	readInt = function(canBeEmpty = false) {
		var result = parseInt(readlineSync.question("> "));
		if (typeof result === "number") {
			if(isNaN(result)) {
				if(canBeEmpty)
					return 0;
			} else
				return result;
		}
		return readInt();
	}

	readString = function() {
		var result = readlineSync.question("> ");
		if (result.length > 0)
			return result;
		return readString();
	}

	pickOption = function(options) {
		console.log();
		console.log("Select an option:");
		for(var i = 0; i < options.length; i++){
			console.log(" " + (i + 1) + ": " + options[i]);
		}
		console.log();
		
		var result = readInt();
		if(result > 0 && result <= options.length) {
			console.log();
			return result - 1;
		}
		return pickOption(options);
	}
})();