var motor = require('./motor')

module.exports = moveSteering

function moveSteering (data, cb) {
  var finishedMotors = 0
  var leftMotor = {
    port: data.port[0],
    command: data.command,
    opts: data.opts.left
  }
  var rightMotor = {
    port: data.port[1],
    command: data.command,
    opts: data.opts.right
  }

  motor(leftMotor, checkFinished)
  motor(rightMotor, checkFinished)

  function checkFinished (err, val) {
    finishedMotors++
    if (finishedMotors === 2) {
      cb(err, val)
    }
  }
}
