const DbConnectionHandler = require('../handlers/db-connection.handler')

module.exports = (socket) => {
  console.log('onSocketConnection')

  socket.on('disconnect', () => {
    if (socket.dbc) socket.dbConnection.close()
    console.log('onSocketDisconnection')
  })

  socket.on('db-connect', async(data) => {
    socket.dbConnection = new DbConnectionHandler(data)
    await socket.dbConnection.authenticate()

    socket.dbConnection.on('payload', (payload) => {
      socket.emit('db-payload', payload)
    })

    socket.emit('db-connected')
  })

  socket.on('db-query', async(data) => {
    socket.dbConnection.query({ ref: data.ref, query: data.query })
  })
}
