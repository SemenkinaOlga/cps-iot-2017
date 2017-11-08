var http = require("http").createServer(handler);
var io = require("socket.io").listen(http); // socket.io for permanent connection between server and client
var fs = require("fs"); // variable for file system
var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 9");
    board.pinMode(9, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 10");
    board.pinMode(10, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Enabling Push Button on pin 2");
    board.pinMode(2, board.MODES.INPUT);
});

function handler(req, res){
    fs.readFile(__dirname + "/example07.html",
    function(err, data){
        if(err){
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Error loading html page.");
        }
        res.writeHead(200);
        res.end(data);
    })
}

http.listen(8080); // server will listen on port 8080

var timerGreenOn;
var timerGreenOff;
var timerBlueOn;
var timerBlueOff;
var timerYellowOn;
var timerYellowOff;
var timerRedOn;
var timerRedOff;

var sendValueViaSocket = function(){};

board.on("ready", function(){
    console.log("board ready");
    io.sockets.on("connection", function(socket) {
        console.log("coon");
        console.log("Socket id: " + socket.id);
        socket.emit("massageToClient", "Srv connected, board OK");
        
        sendValueViaSocket = function(value){
            io.sockets.emit("massageToClient", value);
        }
    });//end of socket.on
    
   board.digitalRead(2, function(value) {
        if (value == 0) {
            console.log("LED OFF");
            board.digitalWrite(13, board.LOW);
            board.digitalWrite(10, board.LOW);
            board.digitalWrite(9, board.LOW);
            board.digitalWrite(8, board.LOW);
            console.log("Value = 0");
            sendValueViaSocket(0);
        }
        if (value == 1) {
            console.log("LED ON");
            board.digitalWrite(13, board.HIGH);
            board.digitalWrite(10, board.HIGH);
            board.digitalWrite(9, board.HIGH);
            board.digitalWrite(8, board.HIGH);
            console.log("Value = 1");
            sendValueViaSocket(1);
        }
        
    }); 
});