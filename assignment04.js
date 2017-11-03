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
});

function handler(req, res){
    fs.readFile(__dirname + "/assignment04.html",
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
var timerAllOn;
var timerAllOff;

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
        if (commandNo == "5") {
            board.digitalWrite(9, board.HIGH); 
        }
        if (commandNo == "4") {
            board.digitalWrite(9, board.LOW); 
        }
        if (commandNo == "6") {
            board.digitalWrite(10, board.LOW); 
        }
        if (commandNo == "7") {
            board.digitalWrite(10, board.HIGH); 
        }  
        if (commandNo == "8") {
            board.digitalWrite(8, board.LOW);
            board.digitalWrite(9, board.LOW);
            board.digitalWrite(10, board.LOW);
            board.digitalWrite(13, board.LOW);
        }
        if (commandNo == "9") {
            board.digitalWrite(8, board.HIGH);
            board.digitalWrite(9, board.HIGH);
            board.digitalWrite(10, board.HIGH);
            board.digitalWrite(13, board.HIGH);
        }  
    });
    
    socket.on("blinkOnGreen", function(){
        board.digitalWrite(13, board.HIGH); // write high on pin 13
        timerGreenOn = setInterval(function blink() {
            board.digitalWrite(13, board.HIGH);
            timerGreenOff = setTimeout(function () {board.digitalWrite(13, board.LOW);}, 1000);
            return blink;
        }(), 1500);
    });
    
    socket.on("blinkOffGreen", function(){
        board.digitalWrite(13, board.LOW);
        clearTimeout(timerGreenOn);
        clearTimeout(timerGreenOff);
    });
    
    socket.on("blinkOnBlue", function(){
        board.digitalWrite(8, board.HIGH); // write high on pin 8
        timerBlueOn = setInterval(function blink() {
            board.digitalWrite(8, board.HIGH);
            timerBlueOff = setTimeout(function () {board.digitalWrite(8, board.LOW);}, 1000);
            return blink;
        }(), 1500);
    });
    
    socket.on("blinkOffBlue", function(){
        board.digitalWrite(8, board.LOW);
        clearTimeout(timerBlueOn);
        clearTimeout(timerBlueOff);
    });
    
    socket.on("blinkOnYellow", function(){
        board.digitalWrite(9, board.HIGH); // write high on pin 8
        timerYellowOn = setInterval(function blink() {
            board.digitalWrite(9, board.HIGH);
            timerYellowOff = setTimeout(function () {board.digitalWrite(9, board.LOW);}, 1000);
            return blink;
        }(), 1500);
    });
    
    socket.on("blinkOffYellow", function(){
        board.digitalWrite(9, board.LOW);
        clearTimeout(timerYellowOn);
        clearTimeout(timerYellowOff);
    });
    
    socket.on("blinkOnRed", function(){
        board.digitalWrite(10, board.HIGH); // write high on pin 8
        timerRedOn = setInterval(function blink() {
            board.digitalWrite(10, board.HIGH);
            timerRedOff = setTimeout(function () {board.digitalWrite(10, board.LOW);}, 1000);
            return blink;
        }(), 1500);
    });
    
    socket.on("blinkOffRed", function(){
        board.digitalWrite(10, board.LOW);
        clearTimeout(timerRedOn);
        clearTimeout(timerRedOff);
    });
    
    socket.on("blinkOnAll", function(){
        board.digitalWrite(8, board.HIGH); // write high on pin 8
        board.digitalWrite(9, board.HIGH); // write high on pin 8
        board.digitalWrite(10, board.HIGH); // write high on pin 8
        board.digitalWrite(13, board.HIGH); // write high on pin 8
        timerRedOn = setInterval(function blink() {
            board.digitalWrite(10, board.HIGH);
            timerRedOff = setTimeout(function () {board.digitalWrite(10, board.LOW);}, 1000);
            return blink;
        }(), 1500);
        timerGreenOn = setInterval(function blink() {
            board.digitalWrite(13, board.HIGH);
            timerGreenOff = setTimeout(function () {board.digitalWrite(13, board.LOW);}, 1000);
            return blink;
        }(), 1500);
        timerYellowOn = setInterval(function blink() {
            board.digitalWrite(9, board.HIGH);
            timerYellowOff = setTimeout(function () {board.digitalWrite(9, board.LOW);}, 1000);
            return blink;
        }(), 1500);
        timerBlueOn = setInterval(function blink() {
            board.digitalWrite(8, board.HIGH);
            timerBlueOff = setTimeout(function () {board.digitalWrite(8, board.LOW);}, 1000);
            return blink;
        }(), 1500);
    });
    socket.on("blinkOffAll", function(){
        board.digitalWrite(8, board.LOW);
        board.digitalWrite(9, board.LOW);
        board.digitalWrite(10, board.LOW);
        board.digitalWrite(13, board.LOW);
        clearTimeout(timerRedOn);
        clearTimeout(timerRedOff);
        clearTimeout(timerYellowOn);
        clearTimeout(timerYellowOff);
        clearTimeout(timerBlueOn);
        clearTimeout(timerBlueOff);
        clearTimeout(timerGreenOn);
        clearTimeout(timerGreenOff);
    });
});