# pretty-stream

Format a stream to make it more human readable

```
npm install pretty-stream
```

## Usage

If stream content is regular ascii (or unicode) it will just be forwarded.
If it is binary it will be converted to hexadecimal notation.
All stream lines are prefixed with the offset of line.

``` js
var pretty = require('pretty-stream')
var net = require('net')

// make a raw http request for a logo
var socket = net.connect(80, 'nodejs.org')
socket.write('GET /images/logo.png HTTP/1.1\r\n')
socket.write('Host: nodejs.org\r\n\r\n')
socket.end()

// just pipe it through the prettifier and out to stdout
socket.pipe(pretty()).pipe(process.stdout)
```

Running the above will print something like

```
00000000  HTTP/1.1 200 OK
00000017  Server: nginx
00000032  Date: Wed, 17 Sep 2014 06:56:41 GMT
00000069  Content-Type: image/png
00000094  Content-Length: 5081
00000116  Last-Modified: Wed, 19 Feb 2014 02:46:11 GMT
00000162  Connection: keep-alive
00000186  Accept-Ranges: bytes
00000208
00000210  89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 00 f5 00 00 00 42 08 06 00
00000237  00 00 8f 7e 90 a8 00 00 00 19 74 45 58 74 53 6f 66 74 77 61 72 65 00 41 64 6f 62
... many lines here ...
00005286  44 ae 42 60 82
```

If you do not want all the binary output set `truncate:true`

``` js
socket.pipe(pretty({truncate:true})).pipe(process.stdout)
```

This will truncate the binary output producing something like

```
00000000  HTTP/1.1 200 OK
00000017  Server: nginx
00000032  Date: Wed, 17 Sep 2014 06:56:41 GMT
00000069  Content-Type: image/png
00000094  Content-Length: 5081
00000116  Last-Modified: Wed, 19 Feb 2014 02:46:11 GMT
00000162  Connection: keep-alive
00000186  Accept-Ranges: bytes
00000208
00000210  89 50 4e 47 0d 0a 1a 0a 00 00 (...)
... no more lines here ...
```

If the response only contains text output it will just be forwarded

``` js
var socket = net.connect(80, 'nodejs.org')
socket.write('GET / HTTP/1.1\r\n') // a text request
...
socket.pipe(pretty()).pipe(process.stdout)
```

Which produces something like

```
00000000  HTTP/1.1 200 OK
00000017  Server: nginx
00000032  Date: Wed, 17 Sep 2014 07:03:27 GMT
00000069  Content-Type: text/html
00000094  Content-Length: 7643
00000116  Last-Modified: Tue, 16 Sep 2014 23:56:06 GMT
00000162  Connection: keep-alive
00000186  Accept-Ranges: bytes
00000208
00000210  <!doctype html>
00000226  <html lang="en">
00000243    <head>
... many lines here ...
```

## Formatting

Use the `text`, `binary`, and `prefix` option if you want to style the output

``` js
var chalk = require('chalk') // lets color things!

socket
  .pipe(pretty({
    text: function(data) {
      return chalk.blue(data)
    },
    binary: function(data) {
      return chalk.red(data)
    },
    prefix: function(data) {
      return chalk.grey(data)
    }
  })
  .pipe(process.stdout)
```

## More options

* `text: false` - all output is treated as binary (printed as hexadecimal)
* `binary: false` - all output is treated as text
* `prefix: false` - disable offset prefixing
* `truncate: true` - truncate binary output

## License

MIT
