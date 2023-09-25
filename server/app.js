const express = require('express');
const cors = require('cors');
const io = require('socket.io')(8080, {
  cors: {
    origin: 'http://localhost:3002',
  },
});

// Connect DB
require('./db/connection');

// Import Files
const Users = require('./models/Users');
const userRouter = require('./routeHandlers/users');
const conversationRouter = require('./routeHandlers/conversations');

// app Use
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 8000;

// Socket.io
let users = [];
io.on('connection', (socket) => {
  console.log('User connected', socket.id);
  socket.on('addUser', (userId) => {
    const isUserExist = users.find((user) => user.userId === userId);
    if (!isUserExist) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit('getUsers', users);
    }
  });

  socket.on(
    'sendMessage',
    async ({ senderId, receiverId, message, conversationId }) => {
      const receiver = users.find((user) => user.userId === receiverId);
      const sender = users.find((user) => user.userId === senderId);
      const user = await Users.findById(senderId);
      console.log('sender :>> ', sender, receiver);
      if (receiver) {
        io.to(receiver.socketId)
          .to(sender.socketId)
          .emit('getMessage', {
            senderId,
            message,
            conversationId,
            receiverId,
            user: { id: user._id, fullName: user.fullName, email: user.email },
          });
      } else {
        io.to(sender.socketId).emit('getMessage', {
          senderId,
          message,
          conversationId,
          receiverId,
          user: { id: user._id, fullName: user.fullName, email: user.email },
        });
      }
    }
  );

  socket.on('disconnect', () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit('getUsers', users);
  });
  // io.emit('getUsers', socket.userId);
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome');
});

app.use(userRouter);
app.use(conversationRouter);

app.listen(port, () => {
  console.log('listening on port ' + port);
});
