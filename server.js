var port = process.env.PORT || 3000
var fs = require('fs')
var express = require('express')
var app = express()
var version = 'processing...'
fs.readFile('version', 'utf8', function (err,data) { version=data })

app.get('/', function (req, res) {
  res.send('Hello World! ' + version)
})

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!')
})
