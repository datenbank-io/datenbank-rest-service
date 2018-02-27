module.exports = (socket) => {
  console.log('socket connection...')

  socket.on('disconnect', () => {
    console.log('disconnect...')
  })

  socket.on('test', (data) => {
    console.log(data)
  })
}
