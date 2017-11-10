var http = require("http").createServer(handler);
var io = require("socket.io").listen(http); // socket.io for permanent connection between server and client
var fs = require("fs"); // variable for file system
var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 10");
    board.pinMode(10, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Enabling analog Pin 0");
    board.pinMode(0, board.MODES.ANALOG); // analog pin 0
});

function handler(req, res){
    fs.readFile(__dirname + "/example10.html",
    function(err, data){
        if(err){
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Error loading html page.");
        }
        res.writeHead(200);
        res.end(data);
    });
}

var last_value = null;
var last_sent = null;
     
http.listen(8080); // server will listen on port 8080

var desiredValue = 0; // desired value var
     
board.on("ready", function ()
{

    board.analogRead(0, function(value){
        desiredValue = value; // continuous read of analog pin 0
    });
    
    io.sockets.on("connection", function(socket){
        socket.emit("messageToClient", "Server connected, board ready.");
        setInterval(sendValues, 40, socket); // na 40ms we send message to client     
    }); // end board.digitalRead on pin 2
    
});

function sendValues (socket) {
    socket.emit("clientReadValues",
    {
        "desiredValue": desiredValue
    });
};