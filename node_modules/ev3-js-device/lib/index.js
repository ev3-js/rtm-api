var fs = require('fs')

module.exports = Device

function Device (path) {
  this.path = path
}

Device.prototype.write = function (prefix, cmd, cb) {
  return fs.writeFile(this.path + '/' + prefix, cmd, cb)
}

Device.prototype.read = function (prop) {
  return fs.readFileSync(this.path + '/' + prop, 'utf-8').trim()
}
