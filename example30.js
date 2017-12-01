var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0",function(){
    console.log("Connection to Arduino");
    console.log("Enabling pins");
    board.pinMode(13, board.MODES.OUTPUT); // enable pin 13 for turning the LED on and off
    board.pinMode(0, board.MODES.ANALOG); // enable analog pin 0
    board.pinMode(1, board.MODES.ANALOG); // enable analog pin 1
    board.pinMode(2, board.MODES.OUTPUT); // direction of DC motor
    board.pinMode(3, board.MODES.PWM); // PWM of motor
    board.pinMode(4, board.MODES.OUTPUT); // direction of DC motor
});

var fs  = require("fs");

var options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
};

var https = require("https").createServer(options, handler) // here the argument "handler" is needed, which is used latter on -> "function handler (req, res); in this line, we create the server! (https is object of our app)
  , io  = require("socket.io").listen(https, { log: false })
  , url = require("url");

function handler(req, res) {
    fs.readFile(__dirname + "/example30.html",
    function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Error loading html page.");
        }
    res.writeHead(200);
    res.end(data);
    })
}

https.listen(8080);  // determine on which port we will listen | port 80 is usually used by LAMP | This could be determined on the router (http is our main object, i.e.e app)

console.log("Use (S) httpS! - System Start - Use (S) httpS!"); // we print into the console that in the Chrome browser, the httpS (S!=Secure) should be used i.e. https://...

board.on("ready", function() {

io.sockets.on("connection", function(socket) {  // from the parentesis ( on we have an argument of function -> at "connection" the argument is conveyed, i.e. function(socket)
                                                // when somebody calls an IP over browser (this means that browser sends something to node.js) the "connection" is established
                                                // so each time when browser request something from the server the connection is established    
                                                // in this case, the client wants to send something (when somebody access our server over IP and port)
                                                // when the connection is established, we have to execute the function : function(socket)    
                                                // here the data of the socket is in the argument, i.e. argument=socket
                                                // the unique socket_id is created
    
    socket.on("left", function(data) { // so we listen to the socket when the connecton is established .on("connection"...), and we wait for the message "left"
        board.digitalWrite(13, board.HIGH); // if we hear the message "left" we write HIGH value on pin 13
        board.digitalWrite(2,0); 
        board.digitalWrite(4,1);
        board.analogWrite(3, Math.abs(50));
    });
    
    socket.on("stop", function(data) {
        board.digitalWrite(13, board.LOW);
        board.analogWrite(3, 0);
    });
    
    socket.on("right", function(data) {
        board.digitalWrite(13, board.HIGH);
        board.digitalWrite(2,1);
        board.digitalWrite(4,0);
        board.analogWrite(3, Math.abs(50));
    });
    
    socket.emit("messageToClient", "Srv connected, board OK");
    socket.emit("staticMsgToClient", "Srv connected, board OK");
    

    setInterval(sendValues, 40, socket); // on 40ms trigerr func. sendValues
    
    socket.on("startControlAlgorithm", function(numberOfControlAlgorithm){
       startControlAlgorithm(numberOfControlAlgorithm); 
    });
    
    socket.on("sendPosition", function(position) {
        readAnalogPin0Flag = 0; // we don't read from the analog pin anymore, value comes from GUI
        desiredValue = position; // GUI takes control
        socket.emit("messageToClient", "Position set to: " + position)
    });

    socket.on("stopControlAlgorithm", function(){
       stopControlAlgorithm(); 
    });
    
    sendValueViaSocket = function (value) {
        io.sockets.emit("messageToClient", value);
    };
    
    sendStaticMsgViaSocket = function(value) {
        io.sockets.emit("staticMsgToClient", value);  
    };

});
    
}); // end of board.on ready

function controlAlgorithm (parameters) {
    if (parameters.ctrlAlgNo == 1) {
        pwm = parameters.pCoeff*(desiredValue-actualValue);
        err = desiredValue-actualValue;
        errAbs = Math.abs(err);
        errSumAbs += Math.abs(err);
        if (pwm > pwmLimit) {pwm =  pwmLimit}; // to limit pwm values
        if (pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit pwm values
        if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // direction if > 0
        if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // direction if < 0
        board.analogWrite(3, Math.abs(pwm));
    }
    if (parameters.ctrlAlgNo == 2) {
        err = desiredValue - actualValue; // error as difference between desired and actual val.
        errSum += err; // sum of errors | like integral
        errSumAbs += Math.abs(err);
        dErr = err - lastErr; // difference of error
        // we will put parts of expression for pwm to
        // global workspace
        KpE = parameters.Kp1*err;
        KiIedt = parameters.Ki1*errSum;
        KdDe_dt = parameters.Kd1*dErr;
        pwm = KpE + KiIedt + KdDe_dt; // we use above parts
        lastErr = err; // save the value of error for next cycle to estimate the derivative
        if (pwm > pwmLimit) {pwm =  pwmLimit}; // to limit pwm values
        if (pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit pwm values
        if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // direction if > 0
        if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // direction if < 0
        board.analogWrite(3, Math.abs(pwm));        
    }
    if (parameters.ctrlAlgNo == 3) {
        err = desiredValue - actualValue; // error as difference between desired and actual val.
        errSum += err; // sum of errors | like integral
        errSumAbs += Math.abs(err);
        dErr = err - lastErr; // difference of error
        // we will put parts of expression for pwm to
        // global workspace
        KpE = parameters.Kp2*err;
        KiIedt = parameters.Ki2*errSum;
        KdDe_dt = parameters.Kd2*dErr;
        pwm = KpE + KiIedt + KdDe_dt; // we use above parts
        console.log(parameters.Kp2 + "|" + parameters.Ki2 + "|" + parameters.Kd2);
        lastErr = err; // save the value of error for next cycle to estimate the derivative
        if (pwm > pwmLimit) {pwm =  pwmLimit}; // to limit pwm values
        if (pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit pwm values
        if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // direction if > 0
        if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // direction if < 0
        board.analogWrite(3, Math.abs(pwm));        
    }
    

};

function startControlAlgorithm (parameters) {
    if (controlAlgorithmStartedFlag == 0) {
        controlAlgorithmStartedFlag = 1;
        intervalCtrl = setInterval(function(){controlAlgorithm(parameters);}, 30); // call the alg. on 30ms
        console.log("Control algorithm has been started.");
        sendStaticMsgViaSocket("Control alg " + parameters.ctrlAlgNo + " started | " + json2txt(parameters));
        parametersStore = parameters; // store to report back to the client on algorithm stop
    }

};

function stopControlAlgorithm () {
    clearInterval(intervalCtrl); // clear the interval of control algorihtm
    board.analogWrite(3, 0);
    sendStaticMsgViaSocket("Control algorithm " + parametersStore.ctrlAlgNo + " stopped | " + json2txt(parametersStore) + " | errSumAbs = " + errSumAbs);
    controlAlgorithmStartedFlag = 0; // set flag that the algorithm has stopped
    err = 0; // error as difference between desired and actual val.
    errSum = 0; // sum of errors | like integral
    dErr = 0;
    lastErr = 0; // difference
    pwm = 0;
    errSumAbs = 0;

    controlAlgorithmStartedFlag = 0;
    console.log("Control algorithm has been stopped.");
    parametersStore = {}; // empty temporary json object to report at controAlg stop
};

function sendValues (socket) {
    socket.emit("clientReadValues",
    {
    "desiredValue": desiredValue,
    "actualValue": actualValue,
    "pwm": pwm,
    "err": err,
    "errSum": errSum,
    "dErr": dErr,
    "KpE": KpE,
    "KiIedt": KiIedt,
    "KdDe_dt": KdDe_dt,
    "errSumAbs": errSumAbs
    });
};

function json2txt(obj) // function to print out the json names and values
{
  var txt = '';
  var recurse = function(_obj) {
    if ('object' != typeof(_obj)) {
      txt += ' = ' + _obj + '\n';
    }
    else {
      for (var key in _obj) {
        if (_obj.hasOwnProperty(key)) {
          txt += '.' + key;
          recurse(_obj[key]);
        } 
      }
    }
  };
  recurse(obj);
  return txt;
}