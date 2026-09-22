import type {AuthenticatedUser} from '../auth/authService.js';

export type AuthenticatedRequest = {
	user: AuthenticatedUser;
};