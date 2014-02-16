var muzzley = require('muzzley-client');
var gpio = require('rpi-gpio');
var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');
var config = require('./config');

gpio.setup(7, gpio.DIR_OUT);  // Left
gpio.setup(11, gpio.DIR_OUT); // Right
gpio.setup(13, gpio.DIR_OUT); // Forward
gpio.setup(15, gpio.DIR_OUT); // Backward

gpio.setup(12, gpio.DIR_OUT); // LED

var turningLeft = false;
var turningRight = false;
var accelerate = false;
var backUp = false;
var playingSound = false;
var led = false;

var playsound = function (){
  console.log('### Horn ###');
  playingSound = true;
  fs.createReadStream(__dirname + '/mp.mp3')
  .pipe(new lame.Decoder())
  .on('format', function (format) {
    this.pipe(new Speaker(format)).on('close', function(){
      playingSound = false;
      console.log('### Acabou Horn ###');
    });
  });
};

var turnLeft = function (){
  gpio.write(7, true, function(err) {
    if (err) throw err;
    console.log('<---- turnLeft');
    turningLeft = true;
  });
};

var turnRight = function (){
  gpio.write(11, true, function(err) {
    if (err) throw err;
    console.log('turnRight ---->');
    turningRight = true;
  });
};

var stopTurning = function (){
  gpio.write(7, false, function(err) {
    if (err) throw err;
    turningLeft = false;
  });
  gpio.write(11, false, function(err) {
    if (err) throw err;
    turningRight = false;
  });
  console.log('-- stopTurning --');
};

var accelerateTimeout;
var accelerate = function(){
  clearTimeout(backUpTimeout);
  clearTimeout(accelerateTimeout);
  gpio.write(13, true, function(err) {
    if (err) throw err;
    console.log('accelerating ####>');
    turningRight = false;
  });
  accelerateTimeout = setTimeout(stopMoving, 3000);
};

var backUpTimeout;
var backUp = function(){
  clearTimeout(backUpTimeout);
  clearTimeout(accelerateTimeout);
  gpio.write(15, true, function(err) {
    if (err) throw err;
    console.log('<#### backing up');
    turningRight = false;
  });
  backUpTimeout = setTimeout(stopMoving, 5000);
};

var stopMoving= function(){
  clearTimeout(backUpTimeout);
  clearTimeout(accelerateTimeout);
  console.log('## stopMoving ##');
  gpio.write(13, false, function(err) {
    if (err) throw err;
    console.log('## stopMoving ##');
    turningRight = false;
  });
  gpio.write(15, false, function(err) {
    if (err) throw err;
    turningRight = false;
  });
};

var startLed= function(){
  gpio.write(12, true, function(err) {
    if (err) throw err;
    led = true;
    //console.log('## startLed ##');
  });
};

var stopLed= function(){
  gpio.write(12, false, function(err) {
    if (err) throw err;
    led = false;
    //console.log('## stopLed ##');
  });
};

var blinkLed = function(){
  if (led) return stopLed();
  if (!led) return startLed();
};

var participant = null;

var tryToConnect = setTimeout(function () {
  console.log('Lost socket connection Exiting...');
  process.exit(0);
}, 15000);

var blinkTimer  = null;

var connectionOptions = config.connection;

muzzley.connectApp(connectionOptions, function (activity) {
  clearTimeout(tryToConnect);

  console.log('Connected to Muzzley. Activity details:');
  console.log(activity);

  blinkTimer = setInterval(blinkLed, 800);

  activity.on('participantJoin', function (prt) {
    
    clearInterval(blinkTimer); // stop blinking the LED
    startLed(); // start the LED

    prt.changeWidget('gamepad', function (err) {
      if (err) {
        console.log('Change Widget to gamepad was NOT successful. Err: ' + err);
        return;
      }
    });

    participant = prt;

    participant.on('quit', function (action) {
      console.log('Participant quit!');
      stopLed();
      stopMoving();
      stopTurning();
      clearInterval(blinkTimer);
      blinkTimer = setInterval(blinkLed, 800);
    });
    var timeout = null;

    participant.on('action', function (action) {
      clearTimeout(timeout);

      if (config.inactivityTimeout >= 1) {
        timeout = setTimeout(function () {
          console.log('Participant has been kicked due inactivity');
          stopLed();
          clearInterval(blinkTimer);
          blinkTimer = setInterval(blinkLed, 800);
          participant.off('action');
          participant.off('quit');
          stopTurning();
          stopMoving();
          participant = null;
        }, config.inactivityTimeout);
      }

      //
      // Handle the Gamepad input actions
      //

      if (action.c === 'jl'){
        // Joystick actions
        
        if (action.e === 'release'){
          return stopTurning();
        }

        if (action.e === 'press'){
          if (action.v === '180' || action.v === '225' || action.v === '135') {
            if (!turningLeft) {
              stopTurning();
              return turnLeft();
            }
          }
          if (action.v === '0' || action.v === '315' || action.v === '45') {
            if (!turningRight) {
              stopTurning();
              return turnRight();
            }
          }
        }
      }

      // Gamepad buttons actions

      if (action.c === 'bb'){
        if (action.e === 'release'){
          return stopMoving();
        }
        if (action.e === 'press'){
          stopMoving();
          return accelerate();
        }
      }

      if (action.c === 'ba'){
        if (action.e === 'release'){
          return stopMoving();
        }
        if (action.e === 'press'){
          stopMoving();
          return backUp();
        }
      }

      if (action.c === 'bc'){
        if (action.e === 'release'){
          return stopMoving();
        }
        if (action.e === 'press'){
          stopMoving();
          return backUp();
        }
      }

      /*
      if (action.c === 'bd'){
        if (action.e === 'release'){
          return stopLed();
        }
        if (action.e === 'press'){
          stopLed();
          return startLed();
        }
      }
      */

      if (action.c === 'bd'){
        if (action.e === 'press'){
          if (!playingSound) playsound();
        }
      }

    });
  });
});
