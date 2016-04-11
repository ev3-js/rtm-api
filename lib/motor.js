var Device = require('ev3-js-device')
var devices = require('ev3-js-devices').devices

module.exports = motor

function motor (data, cb, path) {
  var port = data.port
  var command = data.command
  var opts = data.opts
  var responses = []

  try {
    var device = new Device(devices(port, path))
  } catch (err) {
    return cb(err)
  }

  if (Object.keys(opts).length > 0) {
    for (var opt in opts) {
      motorWrite(port, opt, opts[opt], writeCommand, path)
    }
  } else {
    motorWrite(port, 'command', command, cb, path)
  }

  function writeCommand (err, response) {
    responses.push(response)
    if (responses.length === Object.keys(opts).length) {
      if (err) {
        cb(err)
      } else {
        motorWrite(port, 'command', command, cb, path)
      }
    }
  }

  function motorWrite (port, opt, value, cb, path) {
    device.write(opt, value, function (err) {
      if (err) {
        if (err.errno === 18) {
          err = new Error(Math.abs(value) + ' is not a valid value for ' + optToParam(opt))
        }
        cb(err)
      }
      cb(null, value)
    })
  }
}

function optToParam (opt) {
  var params = {
    'speed_sp': 'speed',
    'position_sp': 'distance',
    'time_sp': 'time'
  }
  return params[opt]
}
