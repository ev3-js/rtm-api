var Device = require('ev3-js-device')
var devices = require('ev3-js-devices')

var motorDefaults = {
  speed: 300,
  braking: 'brake',
  wait: true
}

module.exports = motor

function motor (data, cb, path) {
  var port = data.port
  var command = data.command
  var opts = data.opts
  var responses = []
  if (Object.keys(opts).length > 0) {
    for (var opt in opts) {
      motorWrite(port, opt, opts[opt], writeCommand, path)
    }
  } else {
    motorWrite(port, 'command', command, cb, path)
  }
  function writeCommand (response) {
    responses.push(response)
    if (responses.length === Object.keys(opts).length) {
      motorWrite(port, 'command', command, cb, path)
    }
  }
}

function motorWrite (port, opt, value, cb, path) {
  // XXX what can synchronously error here. the device?
  try {
    var device = new Device(devices(port, path))
    device.write(opt, value, function (err) {
      if (err) {
        console.log(err)
      }
      cb(null, value)
    })
  } catch (e) {
    console.log(e)
  }
}
