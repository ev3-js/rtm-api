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

### sensor_mode(data, cb)
Set the mode of one of the sensors.

- `data` - Object
```js
{
    port: 'port of sensor',
    command: 'mode'
}
```
- `cb` - callback

### sensor_subscribe(data, cb)
Subscribe to read the values from the sensors and the state of the motors. The first time this is called it begins the polling process. The messages are then emitted via messages as an object.

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

### sensor_unsubscribe(data, cb)

### motor_read(data, cb)

### motor_write(data, cb)

### motors_write(data, cb)

### ping(data, cb)

### setPaths(data, cb)

### reading(data, cb)


[travis-image]: https://img.shields.io/travis/ev3-js/rtm-api.svg?style=flat
[travis-url]: https://travis-ci.org/ev3-js/rtm-api
[git-image]: https://img.shields.io/github/tag/ev3-js/rtm-api.svg?style=flat
[git-url]: https://github.com/ev3-js/rtm-api
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard
[npm-image]: https://img.shields.io/npm/v/ev3-api.svg?style=flat
[npm-url]: https://npmjs.org/package/ev3-api
