var pretty = require('pretty-stream')
var net = require('net')

// make a raw http request for a logo
var socket = net.connect(80, 'nodejs.org')
socket.write('GET /images/logo.png HTTP/1.1\r\n')
socket.write('Host: nodejs.org\r\n\r\n')
socket.end()

// just pipe it through the prettifier and out to stdout
socket.pipe(pretty({truncate:true})).pipe(process.stdout)
