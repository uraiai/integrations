import { error } from 'console';
import type { FunctionDeclaration } from '../../urai.d.ts';

//#region mocksetup for local testing

/* Mock decorator @tool to avoid runtime crash */
function tool(...args: any[]): any {
	// If used as @tool()
	if (args.length === 0) {
		return function () { }; // returns a decorator function
	}

	// If used as @tool
	const [target] = args;
	return target; // no-op
}

(globalThis as any).tool = tool;

class ToolRegistry {
	static register() {
		// no-op mock to avoid runtime errors
	}
	static addDeclarations(..._args: any[]) {
		// no-op mock
	}

}
(globalThis as any).ToolRegistry = ToolRegistry;
(globalThis as any).meta = {
	environment: {
		TIDYCAL_API_KEY: process.env.TIDYCAL_API_KEY || "",
	},
	secrets: {
		TIDYCAL_API_KEY: process.env.TIDYCAL_API_KEY || "",
	},
};
//#endregion

interface TeamResponse {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
}

interface Question {
	id: number;
	booking_id: number;
	question: string;
	answer: string;
	created_at: string;
	updated_at: string;
}

interface Contact {
	id: number;
	name: string;
	email: string;
	phone_number: string;
	ip_address: string;
	timezone: string;
	created_at: string;
	updated_at: string;
}

interface Payment {
	id: number;
	payment_id: string;
	booking_id: number;
	amount: number;
	currency: string;
	created_at: string;
	updated_at: string;
}

interface BookingResponse {
	id: number;
	contact_id: number;
	booking_type_id: number;
	starts_at: string;
	ends_at: string; 
	cancelled_at: string | null;
	created_at: string;
	updated_at: string;
	timezone: string;
	meeting_url: string | null;
	meeting_id: string | null;
	questions: Question[];  // Array as specified in OpenAPI
	contact: Contact;
	payment: Payment;
}

interface TeamUserResponse {
	id: number;
	name: string;
	email: string;
	created_at: string;
	updated_at: string;
}

interface AddTeamUserResponse {
	message: string;
	team_user_id: number;
}

export interface BookingTypeResponse {
	id: number;
	user_id: number;
	title: string;
	description: string;
	duration_minutes: number;
	padding_minutes: number;
	disabled_at: string;
	created_at: string;
	updated_at: string;
	url_slug: string;
	price: number;
	private: boolean;
	latest_availability_days: number;
	redirect_url: string;
	booking_threshold_minutes: number;
	max_bookings: number;
	url: string;
}


const tidyCalTools: FunctionDeclaration[] = [
	{
		name: "list_teams",
		description: "Get a list of teams the authenticated user has access to",
		parameters: {
			schema_type: "Object",
			properties: {
				page: { schema_type: "number", description: "Page number" }
			}
		}
	},
	{
		name: "get_team",
		description: "Get details of a specific team",
		parameters: {
			schema_type: "Object",
			properties: {
				team_id: { schema_type: "number", description: "The ID of the team" }
			},
			required: ["team_id"]
		}
	},
	{
		name: "list_team_bookings",
		description: "Get a list of bookings for a specific team",
		parameters: {
			schema_type: "Object",
			properties: {
				team_id: { schema_type: "number", description: "The ID of the team" },
				page: { schema_type: "number", description: "Page number" },
				start_date: { schema_type: "string", description: "Start date (YYYY-MM-DD)" },
				end_date: { schema_type: "string", description: "End date (YYYY-MM-DD)" },
				email: { schema_type: "string", description: "Filter by email" },
				host_id: { schema_type: "number", description: "Filter by host ID" }
			},
			required: ["team_id"]
		}
	},
	{
		name: "list_team_users",
		description: "Get a list of users in a specific team",
		parameters: {
			schema_type: "Object",
			properties: {
				team_id: { schema_type: "number", description: "The ID of the team" },
				page: { schema_type: "number", description: "Page number" }
			},
			required: ["team_id"]
		}
	},
	{
		name: "add_team_user",
		description: "Add a user to a team by sending an invitation email",
		parameters: {
			schema_type: "Object",
			properties: {
				team_id: { schema_type: "number", description: "The ID of the team" },
				email: { schema_type: "string", description: "Email address of the user to invite" },
				role_name: { schema_type: "string", description: "Role name (admin or user)" }
			},
			required: ["team_id", "email"]
		}
	},
	{
		name: "remove_team_user",
		description: "Remove a user from a team",
		parameters: {
			schema_type: "Object",
			properties: {
				team_id: { schema_type: "number", description: "The ID of the team" },
				team_user_id: { schema_type: "number", description: "The ID of the team user to remove" }
			},
			required: ["team_id", "team_user_id"]
		}
	},
	{
		name: "list_team_booking_types",
		description: "Get a list of booking types for a specific team",
		parameters: {
			schema_type: "Object",
			properties: {
				team_id: { schema_type: "number", description: "The ID of the team" },
				page: { schema_type: "number", description: "Page number" }
			},
			required: ["team_id"]
		}
	},
	{
		name: "create_team_booking_type",
		description: "Create a new booking type for a specific team",
		parameters: {
			schema_type: "Object",
			properties: {
				team_id: { schema_type: "number", description: "The ID of the team" },
				title: { schema_type: "string", description: "Title of the booking type" },
				description: { schema_type: "string", description: "Description of the booking type" },
				duration_minutes: { schema_type: "number", description: "Duration in minutes" },
				url_slug: { schema_type: "string", description: "URL slug for the booking type" }
			},
			required: ["team_id", "title", "description", "duration_minutes", "url_slug"]
		}
	}
];

ToolRegistry.addDeclarations(tidyCalTools);

class TidyCalAPIError extends Error {
	constructor(public status: number, message: string) {
		super(message);
		this.name = 'TidyCalAPIError';
	}
}

export class TidyCalTeams {
	// private baseUrl = "https://tidycal.com/api";
	// private headers: HeadersInit;

	// constructor() {
	//     const apiKey = meta.secrets.TIDYCAL_API_KEY;
	//     this.headers = {
	//         'Authorization': `Bearer ${apiKey}`,
	//         'Content-Type': 'application/json'
	//     };
	// }

	private static baseUrl = "https://tidycal.com/api";
	private static headers: HeadersInit;

	// Static initialization block (available in TypeScript 4.4+)
	static {
		const apiKey = meta.secrets.TIDYCAL_API_KEY;
		this.headers = {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		};
	}

	private static handleError(error: unknown, operation: string): never {
		if (error instanceof TidyCalAPIError) {
			throw error;
		}
		throw new Error(`Failed to ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}

	@tool
	static async list_teams({ page = 1 }: { page?: number } = {}): Promise<TeamResponse[]> {
		try {
			const response = await fetch(`${this.baseUrl}/teams?page=${page}`, {
				headers: this.headers
			});

			if (!response.ok) {
				throw new TidyCalAPIError(
					response.status,
					`API Error in List Teams: ${response.status} - ${response.statusText}`
				);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			this.handleError(error, 'list teams');
		}
	}

	@tool
	static async get_team({ team_id }: { team_id: number }): Promise<TeamResponse> {
		try {
			// Validate required parameter
			if (!team_id || typeof team_id !== 'number') {
				throw new Error('Team ID is required and must be a number');
			}

			const response = await fetch(`${this.baseUrl}/teams/${team_id}`, {
				headers: this.headers
			});

			// Handle API response status
			if (!response.ok) {
				switch (response.status) {
					case 403:
						throw new TidyCalAPIError(403, 'Forbidden - User does not have permission to view this team');
					case 404:
						throw new TidyCalAPIError(404, 'Not Found - Team not found');
					default:
						throw new TidyCalAPIError(
							response.status,
							`API Error in Get Team: ${response.status} - ${response.statusText}`
						);
				}
			}
			const result = await response.json();
			return result.data;
		} catch (error) {
			this.handleError(error, 'get team');
		}
	}

	@tool
	static async list_team_bookings({
		team_id,
		page,
		start_date,
		end_date,
		email,
		host_id
	}: {
		team_id: number;	// required path parameter
		page?: number;	// optional query parameters (?)
		start_date?: string;
		end_date?: string;
		email?: string;
		host_id?: number;
	}): Promise<BookingResponse[]> {
		try {

			//#region validations
			// Validate required parameter
			if (!team_id || typeof team_id !== 'number') {
				throw new Error('Team ID is required and must be a number');
			}

			// Optional parameter validations
			if (start_date && !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
				throw new Error('Start date must be in YYYY-MM-DD format');
			}
			if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
				throw new Error('End date must be in YYYY-MM-DD format');
			}
			if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/i.test(email)) {
				throw new Error('Invalid email format');
			}
			//#endregion

			// Build query parameters
			const params = new URLSearchParams();
			if (page) params.append('page', page.toString());
			if (start_date) params.append('start_date', start_date);
			if (end_date) params.append('end_date', end_date);
			if (email) params.append('email', email);
			if (host_id) params.append('host_id', host_id.toString());
			console.log("Params:", params.toString());
			const response = await fetch(`${this.baseUrl}/teams/${team_id}/bookings?${params}`, {
				headers: this.headers
			});

			// Handle API response status (per OpenAPI spec)
			if (!response.ok) {
				switch (response.status) {
					case 403:
						throw new TidyCalAPIError(403, 'Forbidden - User does not have permission to view this team');
					case 404:
						throw new TidyCalAPIError(404, 'Not Found - Team not found');
					default:
						throw new TidyCalAPIError(
							response.status,
							`API Error in List Team Bookings: ${response.status} - ${response.statusText}`
						);
				}
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			this.handleError(error, 'list team bookings');
		}
	}

	@tool
	static async list_team_users({ team_id, page }: { team_id: number; page?: number; }): Promise<TeamUserResponse[]> {
		try {

			//#region validations
			if (!team_id || typeof team_id !== 'number') {
				throw new Error('Team ID is required and must be a number');
			}
			//#endregion

			// Build query parameters
			const params = new URLSearchParams();
			if (page !== undefined) {
				params.append("page", page.toString());
			}

			// API Request
			const response = await fetch(`${this.baseUrl}/teams/${team_id}/users?${params}`, {
				headers: this.headers
			});

			if (!response.ok) {
				switch (response.status) {
					case 403:
						throw new TidyCalAPIError(403, 'Forbidden - User does not have permission to view this team');
					case 404:
						throw new TidyCalAPIError(404, 'Not Found - Team not found');
					default:
						throw new TidyCalAPIError(
							response.status,
							`API Error in List Team Users: ${response.status} - ${response.statusText}`
						);
				}
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			this.handleError(error, 'list team users');
		}
	}

	@tool
	static async add_team_user({
		team_id,
		email,
		role_name
	}: {
		team_id: number;
		email: string;
		role_name?: 'admin' | 'user';
	}): Promise<AddTeamUserResponse> {
		try {
			//#region validations
			if (!team_id || typeof team_id !== 'number') {
				throw new Error('Team ID is required and must be a number');
			}
			if (!email || typeof email !== 'string') {
				throw new Error("It looks like your email address is missing or invalid. Please check and try again.");
			}
			if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/i.test(email)) {
				throw new Error('Invalid email format');
			}
			if (role_name && !['admin', 'user'].includes(role_name)) {
				throw new Error("Invalid role_name: must be 'admin' or 'user'");
			}
			//#endregion	

			// API call
			const response = await fetch(`${this.baseUrl}/teams/${team_id}/users`, {
				method: 'POST',
				headers: {
					...this.headers,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email, role_name: role_name || 'user'  // default to 'user' if not provided
				})
			});

			// --- Error handling ---
			if (!response.ok) {
				switch (response.status) {
					case 403:
						throw new TidyCalAPIError(403, "Forbidden - User does not have permission to add users to this team");
					case 404:
						throw new TidyCalAPIError(404, "Not Found - Team not found");
					case 422:
						throw new TidyCalAPIError(422, "Validation Error - User already invited or already a member");
					default:
						throw new TidyCalAPIError(
							response.status,
							`API Error in Add Team User: ${response.status} - ${response.statusText}`
						);
				}
			}

			const result = await response.json();
			return result;
		} catch (error) {
			this.handleError(error, 'add team user');
		}
	}

	@tool
	static async remove_team_user({
		team_id,
		team_user_id
	}: {
		team_id: number;
		team_user_id: number;
	}): Promise<{ message: string }> {

		//#region validations
		if (!team_id || typeof team_id !== 'number') {
			throw new Error('Team ID is required and must be a number');
		}
		if (!team_user_id || typeof team_user_id !== 'number') {
			throw new Error('Team User ID is required and must be a number');
		}
		//#endregion

		try {
			const response = await fetch(`${this.baseUrl}/teams/${team_id}/users/${team_user_id}`, {
				method: 'DELETE',
				headers: this.headers
			});

			if (!response.ok) {
				let errorMsg;
				switch (response.status) {
					case 403:
						errorMsg = 'Forbidden - User does not have permission to remove users from this team'
					case 404:
						errorMsg = 'Not Found - Team or team user not found';
					case 422:
						errorMsg = 'Validation Error - User not found in team';
					default:
						errorMsg = `API error in Remove Team User: ${response.status} - ${response.statusText}`;
				}
				throw new TidyCalAPIError(response.status, errorMsg);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			this.handleError(error, 'remove team user');
		}
	}

	@tool
	static async list_team_booking_types({
		team_id,
		page
	}: {
		team_id: number;
		page?: number;
	}): Promise<BookingTypeResponse[]> {

		//#region validations
		if (!team_id || typeof team_id !== 'number') {
			throw new Error('Team ID is required and must be a number');
		}
		//#endregion

		try {
			//query params
			const params = new URLSearchParams();
			if (page !== undefined) {
				params.append('page', page.toString());
			}

			const response = await fetch(`${this.baseUrl}/teams/${team_id}/booking-types${params}`, {
				headers: this.headers
			});

			// Handle API errors
			if (!response.ok) {
				let errorMsg;
				switch (response.status) {
					case 403:
						errorMsg = 'Forbidden - User does not have permission to view this team';
					case 404:
						errorMsg = 'Not Found - Team not found';
					default:
						errorMsg = `API error in List Team Booking Types: ${response.status} - ${response.statusText}`;
				}
				throw new TidyCalAPIError(response.status, errorMsg);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			this.handleError(error, 'list team booking types');
		}
	}


	@tool
	static async create_team_booking_type({
		team_id,
		title,
		description,
		duration_minutes,
		url_slug,
		padding_minutes,
		latest_availability_days,
		private_booking,
		max_bookings,
		max_guest_invites_per_booker,
		display_seats_remaining,
		booking_availability_interval_minutes,
		redirect_url,
		approval_required,
		booking_type_category_id
	}: {
		team_id: number;
		title: string;
		description: string;
		duration_minutes: number;
		url_slug: string;
		padding_minutes?: number;
		latest_availability_days?: number;
		private_booking?: boolean;
		max_bookings?: number;
		max_guest_invites_per_booker?: number;
		display_seats_remaining?: boolean;
		booking_availability_interval_minutes?: number;
		redirect_url?: string;
		approval_required?: boolean;
		booking_type_category_id?: number;
	}): Promise<BookingTypeResponse> {
		
		//#region validations
		if (!team_id || typeof team_id !== 'number') {
			throw new Error('Team ID is required and must be a number');
		}
		if (!title || typeof title !== 'string') {
			throw new Error('Missing required field: title');
		}
		if (!description || typeof description !== 'string') {
			throw new Error('Missing required field: description');
		}
		if (!duration_minutes || isNaN(duration_minutes)) {
			throw new Error('Missing or invalid required field: duration_minutes');
		}
		if (!url_slug || typeof url_slug !== 'string') {
			throw new Error('Missing required field: url_slug');
		}
		//#endregion

		try {
			// Build request body, excluding undefined values
			const body = Object.fromEntries(
				Object.entries({
					title,
					description,
					duration_minutes,
					url_slug,
					padding_minutes,
					latest_availability_days,
					private: private_booking,
					max_bookings,
					max_guest_invites_per_booker,
					display_seats_remaining,
					booking_availability_interval_minutes,
					redirect_url,
					approval_required,
					booking_type_category_id
				}).filter(([_, v]) => v !== undefined)
			);
			
			// const body = {
			// 	title,
			// 	description,
			// 	duration_minutes,
			// 	url_slug,
			// 	...(padding_minutes !== undefined && { padding_minutes }),
			// 	...(latest_availability_days !== undefined && { latest_availability_days }),
			// 	...(private_booking !== undefined && { private: private_booking }),
			// 	...(max_bookings !== undefined && { max_bookings }),
			// 	...(max_guest_invites_per_booker !== undefined && { max_guest_invites_per_booker }),
			// 	...(display_seats_remaining !== undefined && { display_seats_remaining }),
			// 	...(booking_availability_interval_minutes !== undefined && { booking_availability_interval_minutes }),
			// 	...(redirect_url && { redirect_url }),
			// 	...(approval_required !== undefined && { approval_required }),
			// 	...(booking_type_category_id !== undefined && { booking_type_category_id })
			// };

			const response = await fetch(`${this.baseUrl}/teams/${team_id}/booking-types`, {
				method: 'POST',
				headers: {
					...this.headers,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});

			if (!response.ok) {
				let errorMsg;
				switch (response.status) {
					case 403:
						errorMsg = 'Forbidden - User does not have permission to create booking types for this team';
					case 404:
						errorMsg = 'Not Found - Team not found';
					case 422:
						errorMsg = 'Validation Error - Invalid input data';
					default:
						errorMsg = `API error in Create Team Booking Type: ${response.status} - ${response.statusText}`;
				}
				throw new TidyCalAPIError(response.status, errorMsg);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			this.handleError(error, 'create team booking type');
		}
	}
}