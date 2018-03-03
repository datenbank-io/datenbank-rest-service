const socket = require('socket.io-client')('http://localhost:3000')

socket.on('connect', () => {
  socket.emit('db-connect', {
    database: 'mysql',
    username: 'root',
    password: 'sql',
    dialect: 'mysql'
  })
})

socket.on('db-connected', () => {
  socket.emit('db-query', {
    query: 'SELECT * FROM test'
  })
})

socket.on('db-response', (data) => {
  console.log(data)
})

socket.on('disconnect', () => {})
