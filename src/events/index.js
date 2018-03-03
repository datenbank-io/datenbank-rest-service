const Sequelize = require('sequelize')
const dbConnection = {}

module.exports = (socket) => {
  console.log('socket connection...')

  socket.on('disconnect', () => {
    console.log('disconnect...')
    if (dbConnection[socket.id]) dbConnection[socket.id].close()
  })

  socket.on('db-connect', async(data) => {
    dbConnection[socket.id] = new Sequelize(data.database, data.username, data.password, {
      host: data.host,
      dialect: data.dialect,
      pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      operatorsAliases: false
    })
    await dbConnection[socket.id].authenticate()
    socket.emit('db-connected')
  })

  socket.on('db-query', async(data) => {
    const result = await dbConnection[socket.id].query(data.query, {
      type: dbConnection[socket.id].QueryTypes.SELECT
    })

    socket.emit('db-response', result)
  })
}
