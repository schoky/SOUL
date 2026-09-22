import type {
	FastifyReply,
	FastifyRequest
} from 'fastify';

import {
	getCurrentUserByToken
} from '../auth/authService.js';

const SESSION_COOKIE =
	'soul_session';

export async function authenticateRequest(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const token =
		request.cookies[SESSION_COOKIE];
	
	if (!token) {
		return reply
		.code(401)
		.send({
			error: 'Not authenticated'
		});
	}
	
	const user =
		await getCurrentUserByToken(token);
	
	if (!user) {
		reply.clearCookie(
			SESSION_COOKIE,
			{
				path: '/'
			}
		);
		
		return reply
		.code(401)
		.send({
			error: 'Not authenticated'
		});
	}
	
	request.user = user;
}