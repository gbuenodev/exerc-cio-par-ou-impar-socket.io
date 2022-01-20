const express = require('express');

const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

let players = [];
let plays = 0;

io.on('connection', (socket) => {
  const oddOrEven = Math.round(Math.random() * 2);
  let team = '';

  if (oddOrEven === 1) {
    team = 'ÍMPAR';
  } else {
    team = 'PAR';
  }

  players.push({ id: socket.id, team });

  io.emit('updatePlayers', players.map(({ id }) => id));

  socket.emit('updateTeam', team);

  socket.on('play', (value) => {
    plays += 1;
    const playerIndex = players.findIndex(({ id }) => id === socket.id);
    players[playerIndex].value = +value;
    const sum = players.map(({ value }) => value).reduce((acc, cur) => acc + cur, 0);
    const result = sum % 2 === 0 ? 'PAR' : 'ÍMPAR';
    if (plays === players.length) {
      io.emit('winners', { sum, result });
      plays = 0;
    }
  });

  socket.on('disconnect', () => {
    players = players.filter(({ id }) => id !== socket.id);
    io.emit('updatePlayers', players.map(({ id }) => id));
  });
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + 'index.html');
});

http.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000')
});
