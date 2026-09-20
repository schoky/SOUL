import {createServer} from 'node:http';
import {Server} from 'socket.io';

const httpServer = createServer();

const io = new Server(httpServer, {
	cors: {
		origin: 'http://localhost:5173'
	}
});

io.on('connection', (socket) => {
	console.log(`Игрок подключился: ${socket.id}`);
	
	socket.on('disconnect', () => {
		console.log(`Игрок отключился: ${socket.id}`);
	});
});

httpServer.listen(3000, () => {
	console.log('SOUL server запущен на http://localhost:3000');
});