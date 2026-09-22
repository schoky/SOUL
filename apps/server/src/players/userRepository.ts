import type {
	Profile,
	User
} from '@soul/database';

import {database} from '../database/index.js';

export type CreateUserData = {
	email: string;
	passwordHash: string;
	nickname: string;
	avatar?: string;
};

export async function createUser(
	data: CreateUserData
): Promise<User & {profile: Profile}> {
	const user = await database.user.create({
		data: {
			email: data.email,
			passwordHash: data.passwordHash,
			
			profile: {
				create: {
					nickname: data.nickname,
					avatar: data.avatar
				}
			}
		},
		
		include: {
			profile: true
		}
	});
	
	const profile = user.profile;
	
	if (!profile) {
		throw new Error(
			'User was created without a profile'
		);
	}
	
	return {
		...user,
		profile
	};
}

export async function findUserById(
	userId: string
): Promise<
	(User & {profile: Profile | null}) | null
> {
	return database.user.findUnique({
		where: {
			id: userId
		},
		
		include: {
			profile: true
		}
	});
}

export async function findUserByEmail(
	email: string
): Promise<
	(User & {profile: Profile | null}) | null
> {
	return database.user.findUnique({
		where: {
			email
		},
		
		include: {
			profile: true
		}
	});
}

export async function updateUserLastLoginAt(
	userId: string,
	lastLoginAt: Date
): Promise<void> {
	await database.user.update({
		where: {
			id: userId
		},
		data: {
			lastLoginAt
		}
	});
}

export type UpdateUserProfileData = {
	nickname?: string;
	avatar?: string | null;
};

export async function updateUserProfile(
	userId: string,
	data: UpdateUserProfileData
) {
	return database.profile.update({
		where: {
			userId
		},
		data
	});
}