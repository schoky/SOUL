import type {UserRole} from '@soul/database';

import {
	createUser,
	findUserByEmail,
	updateUserLastLoginAt
} from '../players/userRepository.js';

import {
	hashPassword,
	verifyPassword
} from './password.js';

import {
	createUserSession,
	getSessionByToken,
	revokeSession
} from './sessionService.js';

export type RegisterUserInput = {
	email: string;
	password: string;
	nickname: string;
	avatar?: string;
	ipAddress?: string;
	userAgent?: string;
};

export type LoginUserInput = {
	email: string;
	password: string;
	ipAddress?: string;
	userAgent?: string;
};

export type AuthenticatedUser = {
	id: string;
	email: string;
	role: UserRole;
	isBlocked: boolean;
	lastLoginAt: Date | null;
	createdAt: Date;
	profile: {
		id: string;
		nickname: string;
		avatar: string | null;
	};
};

function normalizeEmail(
	email: string
): string {
	return email.trim().toLowerCase();
}

function normalizeNickname(
	nickname: string
): string {
	return nickname.trim();
}

function validateRegisterInput(
	input: RegisterUserInput
): void {
	const email =
		normalizeEmail(input.email);
	
	const nickname =
		normalizeNickname(input.nickname);
	
	if (!email) {
		throw new Error(
			'Email is required'
		);
	}
	
	if (!email.includes('@')) {
		throw new Error(
			'Invalid email'
		);
	}
	
	if (!input.password) {
		throw new Error(
			'Password is required'
		);
	}
	
	if (input.password.length < 8) {
		throw new Error(
			'Password must be at least 8 characters long'
		);
	}
	
	if (!nickname) {
		throw new Error(
			'Nickname is required'
		);
	}
	
	if (
		nickname.length < 3 ||
		nickname.length > 20
	) {
		throw new Error(
			'Nickname must be between 3 and 20 characters long'
		);
	}
}

function toAuthenticatedUser(
	user: {
		id: string;
		email: string;
		role: UserRole;
		isBlocked: boolean;
		lastLoginAt: Date | null;
		createdAt: Date;
		profile: {
			id: string;
			nickname: string;
			avatar: string | null;
		} | null;
	}
): AuthenticatedUser {
	if (!user.profile) {
		throw new Error(
			'User profile not found'
		);
	}
	
	return {
		id: user.id,
		email: user.email,
		role: user.role,
		isBlocked: user.isBlocked,
		lastLoginAt: user.lastLoginAt,
		createdAt: user.createdAt,
		profile: {
			id: user.profile.id,
			nickname: user.profile.nickname,
			avatar: user.profile.avatar
		}
	};
}

export async function registerUser(
	input: RegisterUserInput
) {
	validateRegisterInput(input);
	
	const email =
		normalizeEmail(input.email);
	
	const nickname =
		normalizeNickname(input.nickname);
	
	const existingUser =
		await findUserByEmail(email);
	
	if (existingUser) {
		throw new Error(
			'User with this email already exists'
		);
	}
	
	const passwordHash =
		await hashPassword(
			input.password
		);
	
	const user =
		await createUser({
			email,
			passwordHash,
			nickname,
			avatar: input.avatar
		});
	
	const session =
		await createUserSession({
			userId: user.id,
			ipAddress: input.ipAddress,
			userAgent: input.userAgent
		});
	
	return {
		user: toAuthenticatedUser(user),
		token: session.token,
	};
}

export async function loginUser(
	input: LoginUserInput
) {
	const email =
		normalizeEmail(input.email);
	
	if (!email || !input.password) {
		throw new Error(
			'Email and password are required'
		);
	}
	
	const user =
		await findUserByEmail(email);
	
	if (!user) {
		throw new Error(
			'Invalid email or password'
		);
	}
	
	if (user.isBlocked) {
		throw new Error(
			'User is blocked'
		);
	}
	
	const passwordValid =
		await verifyPassword(
			input.password,
			user.passwordHash
		);
	
	if (!passwordValid) {
		throw new Error(
			'Invalid email or password'
		);
	}
	
	const now = new Date();
	
	await updateUserLastLoginAt(
		user.id,
		now
	);
	
	const session =
		await createUserSession({
			userId: user.id,
			ipAddress: input.ipAddress,
			userAgent: input.userAgent
		});
	
	return {
		user: toAuthenticatedUser({
			...user,
			lastLoginAt: now
		}),
		token: session.token,
	};
}

export async function logoutUser(
	token: string
): Promise<void> {
	await revokeSession(token);
}

export async function getCurrentUserByToken(
	token: string
): Promise<AuthenticatedUser | null> {
	const session =
		await getSessionByToken(token);
	
	if (!session) {
		return null;
	}
	
	return toAuthenticatedUser(
		session.user
	);
}