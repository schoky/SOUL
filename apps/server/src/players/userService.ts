import argon2 from 'argon2';

import {
	createUser,
	findUserByEmail,
	findUserById
} from './userRepository.js';

export type RegisterUserInput = {
	email: string;
	password: string;
	nickname: string;
	avatar?: string;
};

export async function registerUser(
	input: RegisterUserInput
) {
	const email =
		input.email.trim().toLowerCase();
	
	const nickname =
		input.nickname.trim();
	
	if (!email) {
		throw new Error(
			'Email is required'
		);
	}
	
	if (!input.password) {
		throw new Error(
			'Password is required'
		);
	}
	
	if (!nickname) {
		throw new Error(
			'Nickname is required'
		);
	}
	
	const existingUser =
		await findUserByEmail(email);
	
	if (existingUser) {
		throw new Error(
			'User with this email already exists'
		);
	}
	
	const passwordHash =
		await argon2.hash(
			input.password
		);
	
	const user =
		await createUser({
			email,
			passwordHash,
			nickname,
			avatar: input.avatar
		});
	
	return {
		id: user.id,
		email: user.email,
		profile: user.profile,
		createdAt: user.createdAt
	};
}

export async function getUserById(
	userId: string
) {
	const user =
		await findUserById(userId);
	
	if (!user) {
		return null;
	}
	
	return {
		id: user.id,
		email: user.email,
		profile: user.profile,
		createdAt: user.createdAt
	};
}