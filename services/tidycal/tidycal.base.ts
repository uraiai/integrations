export class TidyCalAPIError extends Error {
	constructor(public status: number, message: string) {
		super(message);
		this.name = 'TidyCalAPIError';
	}
}

/**
 * Base class that all TidyCal modules extend.
 * Handles authentication, headers, and common error processing.
 */
export abstract class TidyCalAPIBase {
	protected readonly baseUrl = "https://tidycal.com/api";
	protected readonly headers: HeadersInit;

	constructor() {
		const apiKey = process.env.TIDYCAL_API_KEY;
		if (!apiKey) throw new Error("TIDYCAL_API_KEY is not set in environment variables.");

		this.headers = {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		};
	}

	/** Centralized error handler */
	protected handleError(error: unknown, operation: string): never {
		if (error instanceof TidyCalAPIError) {
			throw error;
		}
		const message = error instanceof Error ? error.message : "Unknown error occurred";
		throw new Error(`Failed to ${operation}: ${message}`);
	}
}