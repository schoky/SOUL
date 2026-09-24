const API_URL = 'http://localhost:3000';

export class ApiError extends Error {
	status: number;
	
	constructor(
		message: string,
		status: number
	) {
		super(message);
		
		this.name = 'ApiError';
		this.status = status;
	}
}

export async function apiRequest<T>(
	path: string,
	options: RequestInit = {}
): Promise<T> {
	const headers =
		new Headers(options.headers);
	
	if (
		options.body !== undefined &&
		options.body !== null &&
		!headers.has('Content-Type')
	) {
		headers.set(
			'Content-Type',
			'application/json'
		);
	}
	
	const response =
		await fetch(
			`${API_URL}${path}`,
			{
				...options,
				
				credentials: 'include',
				
				headers
			}
		);
	
	const contentType =
		response.headers.get(
			'content-type'
		);
	
	const data =
		contentType?.includes('application/json')
			? await response.json()
			: null;
	
	if (!response.ok) {
		const message =
			data &&
			typeof data === 'object' &&
			'error' in data &&
			typeof data.error === 'string'
				? data.error
				: 'API request failed';
		
		throw new ApiError(
			message,
			response.status
		);
	}
	
	return data as T;
}