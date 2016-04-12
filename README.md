# rtm-api

[![Build status][travis-image]][travis-url]
[![Git tag][git-image]][git-url]
[![NPM version][npm-image]][npm-url]
[![Code style][standard-image]][standard-url]

A realtime API for use on ev3 robots with [rtm-server](http://github.com/danleavitt0/rtm-server) and [ev3-client](http://github.com/ev3-js/ev3-client)
## Installation

```
npm install ev3-api
```
## Usage

```js
var server = require('rtm-server')
var API = require('ev3-api')

server(API, 5000)
```

## API

### messages
Emitter for communication with the server.

### sensor_mode(data, [cb])
Set the mode of one of the sensors.

#### data
Type: `object`

Object with options for the sensor mode.

##### command
Type: `string`

The [ev3dev sensor mode](http://www.ev3dev.org/docs/sensors/) to set.
##### port
Type: `string`, `number`

The number of the port the sensor is connected to.

#### cb
Type: `function`

Callback function that is called when the sensor mode change is completed. Function should have an error argument.

### sensor_subscribe(data, [cb])
Subscribe to read the values from the sensors and the state of the motors. The first time this is called it begins the polling process. The messages are then emitted via messages as an object.

#### data
Type: `object`

Object that contains the socket id for the emitter to transmit on.

##### socketId
Type: `number`

reading channel ID for emitting the sensor object.

Example sensors object:
```js
{
  'a': {
    'type': 'motor',
    'value': 'running'
  },
  '1': {
    'type': 'sonic',
    'value': 50
  }
}
```

#### cb
Type: `function`

Callback function that is called when the sensor polling has been started.

### sensor_unsubscribe(data, [cb])
Stop receiving information from the sensors. If this is the last connection to the robot, the sensor polling will be stopped.

#### data
Type: `object`

##### socketId
Type: `number`

The ID of which reading channel to close.

#### cb
Type: `function`

Callback function that is called when the sensor polling has been canceled.

### motor_write(data, [cb])
Start a single motor move.

#### data
Type: `object`

Object with information to start motor moves.

##### command
Type: `string`

Type of [ev3dev motor command](http://www.ev3dev.org/docs/tutorials/tacho-motors/#running-the-motor) to run.

##### port
Type: `string`

Letter of the port the motor is attached to.

##### opts
Type: `object`

Options to set for the move command. Check out the [ev3dev tacho-motor tutorial](http://www.ev3dev.org/docs/tutorials/tacho-motors/) for more information on these options. The three most common ones are explained below.

###### speed_sp

Type: `string`

Set the speed of the motors. The tutorial above has a more in depth explanation but the number should stay below 800 for the ev3 motors.

###### time_sp

Type: `string`

Set the time the motor should run for in milliseconds. Should only be used for a `run-timed` command.

###### position_sp

Type: `string`

The degrees the tacho-motor should spin. This is used for the `run-to-rel-pos` and `run-to-abs-pos` commands.

### motors_write(data, [cb])
Moves two motors at the same time. Should be used to handle driving the robot.

#### data
Type: `object`

Object with information to start motor moves.

##### command
Type: `string`

Type of [ev3dev motor command](http://www.ev3dev.org/docs/tutorials/tacho-motors/#running-the-motor) to run.

##### port
Type: `array`

Array of strings that indicate the two drive motors.

Example:
```js
['b', 'c']
```

##### left
Type: `object`

`motor_write` opts object to use for the left motor (first in the ports array). See above for details.

##### right
Type: `object`

`motor_write` opts object to use in the right motor (second in the ports array). See above for details.

#### cb
Type: `function`

Callback function is called either on error or when both motors have successfully written their commands. First argument is `err`.

### ping(data, [cb])
A ping to check the connection to the client.

#### cb
Type: `function`

Function gets passed (err, true).

### setPaths(paths)
Change the default paths to the motors and sensors. Useful for testing purposes.

#### paths
Type: `object`

##### motor
Type: `string`

Path to motor. Default path is `'/sys/class/tacho-motor/'`.

##### sensor
type: `string`

Path to sensor. Default path is `'/sys/class/lego-sensor/'`.

### reading()
Check to see if the sensors are currently reading. Only used for testing.

**Returns** a boolean

[travis-image]: https://img.shields.io/travis/ev3-js/rtm-api.svg?style=flat
[travis-url]: https://travis-ci.org/ev3-js/rtm-api
[git-image]: https://img.shields.io/github/tag/ev3-js/rtm-api.svg?style=flat
[git-url]: https://github.com/ev3-js/rtm-api
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard
[npm-image]: https://img.shields.io/npm/v/ev3-api.svg?style=flat
[npm-url]: https://npmjs.org/package/ev3-api
