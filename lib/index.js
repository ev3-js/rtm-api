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

function sensorSubscribe (data, cb, paths) {
  if (!reading) {
    var sensors = getSensors(paths)
    var motors = getMotors(paths)
    reading = true
    interval = setInterval(sensorRead.bind(null, sensors, motors), 150)
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
    var data = sensors[port].device.read('value0')
    sensorData[port] = {
      type: sensors[port].type,
      value: data
    }
  }
  for (var port in motors) {
    var data = motors[port].device.read('state')
    sensorData[port] = {
      type: sensors[port].type,
      value: data
    }
  }
  foreach(function (val, id) {
    messages.emit(id, sensorData)
  }, readingChannels)
}

function sensorMode (data, cb, path) {
  var port = data.port
  var value = data.value
  var device = new Device(devices(port, path))

  device.write('mode', value, cb)
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
        type: fs.readFileSync(path + '/driver_name', 'utf-8').trim(),
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
      obj[port] = {
        type: fs.readFileSync(path + '/driver_name', 'utf-8').trim(),
        device: new Device(path)
      }
    } catch (e) {}
    return obj
  }, {})
}
