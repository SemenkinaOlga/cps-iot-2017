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
});

function handler(req, res){
    fs.readFile(__dirname + "/assignment02.html",
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

io.sockets.on("connection", function(socket) {
    socket.on("commandToArduino", function(commandNo){
        if (commandNo == "1") {
            board.digitalWrite(13, board.HIGH); // write HIGH on pin 13
        }
        if (commandNo == "0") {
            board.digitalWrite(13, board.LOW); // write LOW on pin 13
        }
        if (commandNo == "2") {
            board.digitalWrite(8, board.LOW); // write LOW on pin 8
        }
        if (commandNo == "3") {
            board.digitalWrite(8, board.HIGH); // write HIGH on pin 8
        }     
    });
    socket.on("blinkOnGreen", function(){
        board.digitalWrite(13, board.HIGH); // write high on pin 13
        timerGreenOn = setInterval(function () {board.digitalWrite(13, board.HIGH);}, 500);
        timerGreenOff = setInterval(function () {board.digitalWrite(13, board.LOW);}, 750);
    });
    socket.on("blinkOffGreen", function(){
        board.digitalWrite(13, board.LOW);
        clearTimeout(timerGreenOn);
        clearTimeout(timerGreenOff);
    });
    socket.on("blinkOnBlue", function(){
        board.digitalWrite(8, board.HIGH); // write high on pin 8
        timerBlueOn = setInterval(function () {board.digitalWrite(8, board.HIGH);}, 1000);
        timerBlueOff = setInterval(function () {board.digitalWrite(8, board.LOW);}, 1250);
    });
    socket.on("blinkOffBlue", function(){
        board.digitalWrite(8, board.LOW);
        clearTimeout(timerBlueOn);
        clearTimeout(timerBlueOff);
    });
});