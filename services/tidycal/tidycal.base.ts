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

	/**
 	* Generic error handler for all TidyCal API calls.
 	* Logs and throws a single clean message.
 	*/
	protected handleError(error: any, operation: string): never {
		let message: string;

		if (error?.status && error?.statusText) {
			message = `${error.status} - ${error.statusText}`;
		} else if (error instanceof Error) {
			message = error.message;
		} else if (typeof error === "string") {
			message = error;
		} else {
			message = JSON.stringify(error);
		}

		// Log once
		console.error(`${operation.toUpperCase()} ERROR: ${message}`);

		// Throw once
		throw new Error(`${operation} error: ${message}`);
	}
}

export class TidyCalAPIError extends Error {
	constructor(public status: number, message: string) {
		super(message);
		this.name = 'TidyCalAPIError';
	}
}