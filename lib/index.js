var devices = require('ev3-js-devices')
var Device = require('ev3-js-device')

var fs = require('fs')
var Emitter = require('component-emitter')
var motor = require('./motor')
var moveSteering = require('./moveSteering')
var foreach = require('@f/foreach')

var readingChannels = {}
var reading = false
var interval

exports.sensor_mode = sensorMode
exports.sensor_subscribe = sensorSubscribe,
exports.sensor_unsubscribe = sensorUnsubscribe,
exports.motor_read = motorRead
exports.motor_write = motor
exports.motors_write = moveSteering
exports.ping = ping
exports.reading = getReading

var messages = exports.messages = new Emitter()

function getReading () {
  return reading
}

messages.on('close', function (socketId) {
  sensorUnsubscribe({socketId: socketId}, function () {})
})

function watchPorts () {
  fs.watch('/sys/class/lego-sensor', function () {
    startSensorRead()
  }
  fs.watch('sys/class/tacho-motor', function () {
    startSensorRead()
  })
}

function startSensorRead () {
  clearInterval(interval)
  var sensors = getSensors()
  var motors = getMotors()
  interval = setInterval(function () { sensorRead(sensors, motors) }, 150)
}

function sensorSubscribe (data, cb, paths) {
  if (!reading) {
    watchPorts()
    reading = true
  }
  readingChannels[data.socketId] = true
  cb(null, true)
}

function sensorUnsubscribe (data, cb) {
  delete readingChannels[data.socketId]
  if (!Object.keys(readingChannels).length) {
    reading = false
    clearInterval(interval)
  }
  return cb(null, true)
}

function sensorRead (sensors, motors) {
  var sensorData = {}
  for (var port in sensors) {
    if (sensors[port].type === 'ir' && sensors[port].mode === 'IR-SEEK'){
      var data = readIR(sensors[port].device)
    } else {
      var data = sensors[port].device.read('value0')
    }
    sensorData[port] = {
      type: sensors[port].type,
      value: data,
    }
  }
  for (var port in motors) {
    var data = motors[port].device.read('state')
    sensorData[port] = {
      type: motors[port].type,
      value: data
    }
  }
  foreach(function (val, id) {
    try {
      messages.emit(id, sensorData)
    } catch (e) {}
  }, readingChannels)
}

function readIR (sensor) {
  var values = {}
  for (var i = 0; i <= 7; i++) {
    var channel = (Math.floor(i / 2) + 1)
    if (i % 2 === 0) {
      values['heading' + channel] = sensor.read('value' + i)
    } else {
      values['distance' + channel] = sensor.read('value' + i)
    }
  }
  return values
}

function sensorMode (data, cb, path) {
  var port = data.port
  var command = data.command
  var device = new Device(devices(port, path))

  device.write('mode', command, cb)
}

function motorRead (data, cb, path) {
  var port = data.port
  var value = data.value

  var device = new Device(devices(port, path))

  cb(null, device.read(value))
}

function ping (data, cb) {
  cb(null, true)
}

function getMotors (paths) {
  return ['a', 'b', 'c', 'd'].reduce(function (obj, port) {
    try {
      var path = devices(port, paths)
      obj[port] = {
        type: typeToDevice(fs.readFileSync(path + '/driver_name', 'utf-8').trim()),
        device: new Device(path)
      }
    } catch (e) {}
    return obj
  }, {})
}

function getSensors (paths) {
  return [1, 2, 3, 4].reduce(function (obj, port) {
    try {
      var path = devices(port, paths)
    } catch (e) {}
    obj[port] = {
      type: typeToDevice(fs.readFileSync(path + '/driver_name', 'utf-8').trim()),
      mode: fs.readFileSync(path + '/mode', 'utf-8').trim(),
      device: new Device(path)
    }
    return obj
  }, {})
}

function typeToDevice (type) {
  var types = {
    'lego-ev3-l-motor': 'motor',
    'lego-ev3-m-motor': 'motor',
    'lego-nxt-motor': 'motor',
    'lego-ev3-us': 'sonic',
    'lego-ev3-touch': 'touch',
    'lego-ntx-touch': 'touch',
    'lego-ev3-color': 'color',
    'lego-ev3-ir': 'ir'
  }
  return types[type]
}
