const { createServer } = require('node:http')
const { resolve } = require('node:path')
const { readFileSync } = require('node:fs')
const { Server } = require('socket.io')

const port = '3000'


const requestListener = (req, res) => {
  switch (req.url) {
    case '/': {
      const clientPage = readFileSync(resolve(__dirname, './index.html'),'utf8')
      
      res.writeHead(200);
      res.end(clientPage)
      break;
    }
    
    case '/socket.io.js': {
      const socketIoScript = readFileSync(resolve(__dirname, './node_modules/socket.io/client-dist/socket.io.js'),'utf8')

      res.writeHead(200)
      res.end(socketIoScript)
      break;
    }

    default: {
      res.writeHead(404);
      res.end('<h1>Page not found. Error 404</h1>')
      break;
    }
  }
}

const httpServer = createServer(requestListener)

const io = new Server(httpServer)
let socketRoom

io.on('connection', (socket) => {
  console.log('INFO: User connected to the socket');
  
  socket.on('room', (room) => {
    console.log('DG>>> ', 'room', room);
    io.emit('room', room)
  })

  socket.on('join', (room) => {
    socketRoom = room
    socket.join(socketRoom)
    socket.to(socketRoom).emit('join', room)
  })

  socket.on('offer', (offer) => {
    socket.to(socketRoom).emit('offer', offer)
  })

  socket.on('answer', (answer) => {
    socket.to(socketRoom).emit('answer', answer)
  })

  socket.on('candidate', (candidate) => {
    socket.to(socketRoom).emit('candidate', candidate)
  })
})

httpServer.listen(port, () => {
  console.log(`INFO: Server started on ${port} port`)
})