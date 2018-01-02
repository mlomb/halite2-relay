# Halite2 Network relay

It works if you don't mess it up.
It supports 2 and 4 players games.

# Requirements
* NodeJS
* ```npm install ws```
* ```npm install readline-sync```
* Copy the ```halite``` executable into the root of the respository (only required by the host)
* Create a file called ```mybot_command.txt``` and write the command to execute your bot e.g. cd ```"C:\MyBot" && .\MyBot.exe"```

# How to use it
* The host will create a room running ```node halite2-relay-server.js```. You'll be asked about the size of the room (2 or 4) and the port you want to run the server at.
* With the server running, and it doesn't matter if you are not the host, all the players will have to run ```node halite2-relay-client.js```. The program will ask about the IP address and the port of the server. If you are the host, you'll write ```127.0.0.1``` or ```localhost```.
* When all players are connected a match should start, everyone will see the output of the halite executable. At the end of the match everyone gets a copy of the replay file.
* A new game will start in 10 seconds.

![cli](pic.png?raw=true)
![replay](pic2.png?raw=true)

# Contributions
Thanks to [fohristiwhirl](https://github.com/fohristiwhirl) for [the idea of the relay](https://github.com/fohristiwhirl/halite2_relay).
