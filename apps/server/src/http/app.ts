import Fastify from 'fastify';

import cookie from '@fastify/cookie';
import cors from '@fastify/cors';

import authRoutes from './routes/auth.js';


export async function createHttpApp() {
	const app = Fastify({
		logger: true
	});
	
	await app.register(cors, {
		origin: 'http://localhost:5173',
		credentials: true
	});
	
	await app.register(cookie);
	
	await app.register(
		authRoutes,
		{
			prefix: '/api/auth'
		}
	);
	
	return app;
}