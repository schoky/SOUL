import {Server} from 'socket.io';

import {database} from './database/index.js';
import {createHttpApp} from './http/app.js';

async function startServer() {
	const app =
		await createHttpApp();
	
	await database.$connect();
	
	console.log(
		'Подключение к PostgreSQL установлено'
	);
	
	const io = new Server(
		app.server,
		{
			cors: {
				origin:
					'http://localhost:5173',
				credentials: true
			}
		}
	);
	
	io.on('connection', (socket) => {
		console.log(
			`Игрок подключился: ${socket.id}`
		);
		
		socket.on('disconnect', () => {
			console.log(
				`Игрок отключился: ${socket.id}`
			);
		});
	});
	
	await app.listen({
		port: 3000,
		host: 'localhost'
	});
	
	console.log(
		'SOUL server запущен на http://localhost:3000'
	);
}

startServer().catch((error) => {
	console.error(
		'Не удалось запустить сервер:',
		error
	);
	
	process.exit(1);
});