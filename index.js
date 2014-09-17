var through = require('through2')
var os = require('os')

var NEWLINE = new Buffer(os.EOL)

var getText = function(bytes) { // credit @gjtorikian
  for (var i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) return i

    if ((bytes[i] < 7 || bytes[i] > 14) && (bytes[i] < 32 || bytes[i] > 127)) {
      if (bytes[i] > 191 && bytes[i] < 224 && i+1 < bytes.length) {
          i++
          if (bytes[i] < 192) continue
      } else if (bytes[i] > 223 && bytes[i] < 239 && i+2 < bytes.length) {
          i++
          if (bytes[i] < 192 && bytes[i+1] < 192) {
              i++
              continue
          }
      }
      return i
    }
  }
  return bytes.length
}

var toHex = function(buf) {
  return new Buffer(buf.toString('hex').replace(/(..)/g, '$1 '))
}

var shortHex = function() {
  var first = true
  return function(buf) {
    if (!first) return ''
    first = false
    return toHex(buf.slice(0, 10))+'(...)'
  }
}

var toPrefix = function(n) {
  n += ''
  n = '00000000'.slice(n.length)+n+'  '
  return new Buffer(n)
}

var format = function(opts) {
  if (!opts) opts = {}

  var width = 81
  var binary = false
  var missing = width
  var fbinary = opts.truncate ? shortHex() : toHex
  var offset = 0

  var consume = function(bytes) {
    if (binary) bytes = (bytes / 3) | 0
    offset += bytes
  }

  var fmtPrefix = function(data) {
    if (opts.prefix) return opts.prefix(data.toString())
    return data
  }

  var fmt = function(data) {
    if (opts.text && !binary) return opts.text(data.toString())
    if (opts.binary && binary) return opts.binary(data.toString())
    return data
  }

  var push = function(buf) {
    if (binary) buf = fbinary(buf)

    while (buf.length) {
      var next = buf.slice(0, missing)
      var nl = Array.prototype.indexOf.call(next, 10)

      if (missing === width && opts.prefix !== false) stream.push(fmtPrefix(toPrefix(offset)))

      if (!binary) {
        next = new Buffer(next.toString().replace(/\t/g, ' '))
      }

      if (nl > -1) {
        next = next[next.length-1] === 13 ? next.slice(0, nl-1) : next.slice(0, nl)
        buf = buf.slice(nl+1)
        missing = width
        consume(nl+1)
        stream.push(fmt(next))
        stream.push(NEWLINE)
        continue
      }

      buf = buf.slice(next.length)
      missing -= next.length
      consume(next.length)

      if (missing) {
        stream.push(fmt(next))
        continue
      }

      missing = width
      stream.push(fmt(next))
      stream.push(NEWLINE)
      continue
    }
  }

  var stream = through(function ondata(data, enc, cb) {
    if (binary) {
      push(data)
      return cb()
    }

    var offset = getText(data)
    if (offset >= data.length) {
      push(data)
      return cb()
    }

    push(data.slice(0, offset))
    binary = true

    if (missing !== width) {
      stream.push(NEWLINE)
      missing = width
    }
    push(data.slice(offset))

    cb()
  }, function(cb) {
    if (missing !== width) stream.push(NEWLINE)
    cb()
  })

  return stream
}

module.exports = format