import { updateUserProfile } from './userRepository.js';

export type UpdateProfileInput = {
  nickname?: string;
  avatar?: string | null;
};

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const data: UpdateProfileInput = {};

  if (input.nickname !== undefined) {
    const nickname = input.nickname.trim();

    if (nickname.length < 3 || nickname.length > 20) {
      throw new Error('Nickname must be between 3 and 20 characters');
    }

    data.nickname = nickname;
  }

  if (input.avatar !== undefined) {
    if (input.avatar === null) {
      data.avatar = null;
    } else {
      const avatar = input.avatar.trim();

      data.avatar = avatar.length > 0 ? avatar : null;
    }
  }

  if (Object.keys(data).length === 0) {
    throw new Error('At least one profile field is required');
  }

  try {
    return await updateUserProfile(userId, data);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      throw new Error('Nickname is already taken');
    }

    throw error;
  }
}
