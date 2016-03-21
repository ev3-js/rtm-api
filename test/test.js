var test = require('tape')
var API = require('../lib/index')
var Device = require('ev3-js-device')
var devices = require('ev3-js-devices')
var path = require('path')

var defaultPaths = {
  motor: path.join(__dirname, 'fake-sys/class/tacho-motor'),
  sensor: path.join(__dirname, 'fake-sys/class/lego-sensor')
}

test('sensor_mode', function (t) {
  t.plan(2)
  var port = 1
  var sensor = new Device(devices(port, defaultPaths))
  sensor.write('mode', 'IR-PROX', function () {
    t.equals(sensor.read('mode'), 'IR-PROX')
    var sensorModeObj = {
      port: 1,
      value: 'IR-SEEK'
    }
    API['sensor_mode'](sensorModeObj, function (err, val) {
      t.equals(sensor.read('mode'), 'IR-SEEK')
    }, defaultPaths)
  })
})

test('stop reading on socket close', function (t) {
  var messages = API['messages']
  var port = 1
  var sensor = new Device(devices(port, defaultPaths))
  var data = {
    socketId: 1
  }
  API['sensor_subscribe'](data, function (err, val) {
    t.equal(val, true)
    t.equal(API['reading'](), true)
    messages.emit('close', 1)
    setTimeout(function () {
      t.equal(API['reading'](), false)
      t.end()
    }, 100)
  }, defaultPaths)
})

test('sensor_sub and sensor_unsub', function (t) {
  t.plan(4)
  var port = 1
  var sensor = new Device(devices(port, defaultPaths))
  var data = {
    socketId: 1
  }
  API['sensor_subscribe'](data, function (err, val) {
    t.equal(val, true)
    t.equal(API['reading'](), true)
    API['sensor_unsubscribe'](data, function (err, val) {
      t.equal(val, true)
      t.equal(API['reading'](), false)
    })
  }, defaultPaths)
})

test('motor_read', function (t) {
  t.plan(1)
  var port = 'a'
  var motor = new Device(devices(port, defaultPaths))
  var readObj = {
    port: port,
    value: 'state'
  }
  API['motor_read'](readObj, function (err, val) {
    t.equals(motor.read('state'), val)
    resetMotor('a')
  }, defaultPaths)
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
      'duty_cycle_sp': '50'
    }
  }
  var motor = new Device(devices(port, defaultPaths))
  API['motor_write'](runObj, function (err, val) {
    t.equals(motor.read('position_sp'), '1000')
    t.equals(motor.read('duty_cycle_sp'), '50')
    t.equals(motor.read('command'), 'run-to-rel-pos')
    resetMotor('a')
  }, defaultPaths)
})



function resetMotor (port, cb) {
  cb = cb || function () {}
  port = port || 'a'
  var responses = 0
  var motor = new Device(devices(port, defaultPaths))
  motor.write('command', 'run-forever')
  motor.write('position_sp', '0')
  motor.write('duty_cycle_sp', '0')
}
