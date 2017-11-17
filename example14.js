var http = require("http").createServer(handler);
var io = require("socket.io").listen(http); // socket.io for permanent connection between server and client
var fs = require("fs"); // variable for file system
var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Enabling analog Pin 0");
    board.pinMode(0, board.MODES.ANALOG); // analog pin 0
    console.log("Enabling analog Pin 1");
    board.pinMode(1, board.MODES.ANALOG); // analog pin 1
    console.log("Enabling analog Pin 2");
    board.pinMode(2, board.MODES.OUTPUT); // direction of DC motor
    console.log("Enabling analog Pin 3");
    board.pinMode(3, board.MODES.PWM); // PWM of motor i.e. speed of rotation
    console.log("Enabling analog Pin 4");
    board.pinMode(4, board.MODES.OUTPUT); // direction DC motor
});

function handler(req, res){
    fs.readFile(__dirname + "/example14.html",
    function(err, data){
        if(err){
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Error loading html page.");
        }
        res.writeHead(200);
        res.end(data);
    });
}

var controlAlgorihtmStartedFlag = 0; // flag in global scope to see weather ctrlAlg has been started
var intervalCtrl; // var for setInterval in global space
var pwm = 0;

function startControlAlgorithm () {
    if (controlAlgorihtmStartedFlag == 0) {
        controlAlgorihtmStartedFlag = 1; // set flag that the algorithm has started
        intervalCtrl = setInterval(function() {controlAlgorithm(); }, 30); // na 30ms klic
        console.log("Control algorithm started");
    }
};

function stopControlAlgorithm () {
    clearInterval(intervalCtrl); // clear the interval of control algorihtm
    board.analogWrite(3,0); // write 0 on pwm pin to stop the motor
    controlAlgorihtmStartedFlag = 0; // set flag that the algorithm has stopped
};

function controlAlgorithm () {
    pwm = factor*(desiredValue-actualValue);
    if(pwm > 255) {pwm = 255}; // to limit the value for pwm / positive
    if(pwm < -255) {pwm = -255}; // to limit the value for pwm / negative
    if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // določimo smer če je > 0
    if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // določimo smer če je < 0
    board.analogWrite(3, Math.abs(pwm));
};

var last_value = null;
var last_sent = null;
var factor = 0.3; // proportional factor that determines the speed of aproaching toward desired value
     
http.listen(8080); // server will listen on port 8080

var desiredValue = 0; // desired value var
var actualValue = 0; // variable for actual value (output value)
     
board.on("ready", function ()
{

    board.analogRead(0, function(value){
        desiredValue = value; // continuous read of analog pin 0
    });
    
    board.analogRead(1, function(value) {
        actualValue = value; // continuous read of pin A1
    });
    
    startControlAlgorithm();
    
    io.sockets.on("connection", function(socket){
        socket.emit("messageToClient", "Server connected, board ready.");
        setInterval(sendValues, 40, socket); // na 40ms we send message to client  
    
        socket.on("startControlAlgorithm", function(){
            startControlAlgorithm();
        });
            
        socket.on("stopControlAlgorithm", function(){
            stopControlAlgorithm();
        });
        
    });
    
});

function sendValues (socket) {
    socket.emit("clientReadValues",
    { // json notation between curly braces
    "desiredValue": desiredValue,
    "actualValue": actualValue,
    "pwm": pwm
    });
    console.log(desiredValue);
};