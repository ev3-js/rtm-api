var test = require('tape')
var API = require('../lib/index')
var Device = require('ev3-js-device')
var devices = require('ev3-js-devices').devices
var clearDevices = require('ev3-js-devices').clear
var path = require('path')

var defaultPaths = {
  motor: path.join(__dirname, 'fake-sys/class/tacho-motor'),
  sensor: path.join(__dirname, 'fake-sys/class/lego-sensor')
}

API.setPaths(defaultPaths)

test('sensor_mode', function (t) {
  t.plan(2)
  var port = 1
  var sensor = new Device(devices(port, defaultPaths))
  sensor.write('mode', 'IR-PROX', function () {
    t.equals(sensor.read('mode'), 'IR-PROX')
    var sensorModeObj = {
      port: 1,
      command: 'IR-SEEK'
    }
    API['sensor_mode'](sensorModeObj, function (err, val) {
      if (err) {}
      t.equals(sensor.read('mode'), 'IR-SEEK')
    })
  })
})

test('stop reading on socket close', function (t) {
  var messages = API['messages']
  var data = {
    socketId: 1
  }
  API['sensor_subscribe'](data, function (err, val) {
    if (err) {}
    t.equal(val, true)
    t.equal(API['reading'](), true)
    messages.emit('close', 1)
    setTimeout(function () {
      t.equal(API['reading'](), false)
      t.end()
    }, 100)
  })
})

test('sensor_sub and sensor_unsub', function (t) {
  t.plan(4)
  var data = {
    socketId: 1
  }
  API['sensor_subscribe'](data, function (err, val) {
    if (err) {}
    t.equal(val, true)
    t.equal(API['reading'](), true)
    setTimeout(function () {
      API['sensor_unsubscribe'](data, function (err, val) {
        if (err) {}
        t.equal(val, true)
        t.equal(API['reading'](), false)
      })
    }, 1000)
  })
})

test('motor_write', function (t) {
  t.plan(3)
  var port = 'a'
  var runObj = {
    type: 'motor_write',
    id: 1,
    command: 'run-to-rel-pos',
    port: port,
    opts: {
      'position_sp': '1000',
      'speed_sp': '50'
    }
  }
  var motor = new Device(devices(port, defaultPaths))
  API['motor_write'](runObj, function (err, val) {
    if (err) {}
    t.equals(motor.read('position_sp'), '1000')
    t.equals(motor.read('speed_sp'), '50')
    t.equals(motor.read('command'), 'run-to-rel-pos')
    resetMotor('a')
    clearDevices()
    t.end()
  }, defaultPaths)
})

function resetMotor (port, cb) {
  cb = cb || function () {}
  port = port || 'a'
  var motor = new Device(devices(port, defaultPaths))
  motor.write('command', 'run-forever')
  motor.write('position_sp', '0')
  motor.write('duty_cycle_sp', '0')
}
