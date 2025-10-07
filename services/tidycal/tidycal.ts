import {
	TeamResponse,
	TeamUserResponse,
	BookingResponse,
	BookingTypeResponse,
	AddTeamUserResponse,
	TimeslotResponse,
	Question,
	Contact,
	Payment
} from './tidycal.type';
import { TidyCalAPIBase, TidyCalAPIError } from './tidycal.base';
import { isValidEmail } from './tidycal.helper';

const MAX_TITLE_LENGTH = 191;
const MAX_URL_LENGTH = 60000;

export class TidyCalBookings extends TidyCalAPIBase {

	/**
	 * Get a list of bookings.
	 */
	async list_bookings(options?: {
		starts_at?: Date;
		ends_at?: Date;
		cancelled?: boolean;
		page?: number;
		include_teams?: boolean;
	}): Promise<BookingResponse[]> {
		try {
			//Build and validate query parameters
			const params: string[] = [];

			if (options?.starts_at) {
				if (!(options.starts_at instanceof Date) || isNaN(options.starts_at.getTime())) {
					throw new Error("Invalid 'starts_at' value. Must be a valid Date object.");
				}
				params.push(`starts_at=${options.starts_at.toISOString().split("T")[0]}`);
			}

			if (options?.ends_at) {
				if (!(options.ends_at instanceof Date) || isNaN(options.ends_at.getTime())) {
					throw new Error("Invalid 'ends_at' value. Must be a valid Date object.");
				}
				params.push(`ends_at=${options.ends_at.toISOString().split("T")[0]}`);
			}

			if (options?.cancelled !== undefined) {
				params.push(`cancelled=${options.cancelled}`);
			}

			if (options?.page !== undefined) {
				params.push(`page=${options.page}`);
			}

			if (options?.include_teams !== undefined) {
				params.push(`include_teams=${options.include_teams}`);
			}

			const query = params.length ? `?${params.join("&")}` : "";
			console.log("Fetching bookings with query:", query);

			const response = await fetch(`${this.baseUrl}/bookings${query}`, {
				method: "GET",
				headers: this.headers,
			});

			if (!response.ok) {
				throw new Error(`Failed to List Bookings: ${response.status} - ${response.statusText}`);
			}

			const result = await response.json();
			return result.data as BookingResponse[];

		} catch (error: any) {
			this.handleError(error, 'list bookings');
		}
	}

	/**
	 * Get a booking by ID.
	 */
	async get_booking(booking_id: number): Promise<BookingResponse> {
		try {
			// Validate required parameter
			if (!booking_id || typeof booking_id !== 'number') {
				throw new Error('Booking ID is required and must be a number');
			}

			const response = await fetch(`${this.baseUrl}/bookings/${booking_id}`, {
				method: 'GET',
				headers: this.headers
			});

			if (!response.ok) {
				let errorMsg;
				switch (response.status) {
					case 403:
						errorMsg = `Forbidden: You do not have permission to access booking ID ${booking_id}.`;
						break;
					case 404:
						errorMsg = `Not Found: Booking not found.`;
						break;
					case 422:
						errorMsg = `Validation Error`;
						break;
					default:
						errorMsg = `API Error in Get Booking: ${response.status} - ${response.statusText}`;
						break;
				}
				throw new TidyCalAPIError(response.status, errorMsg);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			this.handleError(error, 'get booking');
		}
	}

	/**
	 * Cancel a booking by ID.
	 */
	async cancel_booking(booking_id: number, reason?: string): Promise<BookingResponse> {
		try {
			// Validate required parameter
			if (!booking_id || typeof booking_id !== 'number') {
				throw new Error('Booking ID is required and must be a number');
			}

			const body = reason ? JSON.stringify({ reason }) : JSON.stringify({});

			const response = await fetch(`${this.baseUrl}/bookings/${booking_id}/cancel`, {
				method: 'PATCH',
				headers: this.headers,
				body
			});

			if (!response.ok) {
				let errorMsg = '';
				switch (response.status) {
					case 400:
						errorMsg = `Bad Request - Booking is already cancelled`;
						break;
					case 403:
						errorMsg = `Forbidden - User does not have permission to cancel this booking`;
						break;
					case 404:
						errorMsg = `Not Found - Booking not found`;
						break;
					default:
						errorMsg = `API Error in Cancel Booking: ${response.status} - ${response.statusText}`;
						break;
				}
				throw new TidyCalAPIError(response.status, errorMsg);
			}

			const result = await response.json();
			return result.data;

		} catch (error) {
			this.handleError(error, 'cancel booking');
		}
	}
}

export class TidyCalBookingTypes extends TidyCalAPIBase {
	/** 
	 * Get a list of booking types
	*/
	async list_booking_types(page: number = 1): Promise<BookingTypeResponse[]> {
		try {
			//Validate required parameter
			if (typeof page !== "number" || page <= 0) {
				throw new Error("Invalid 'page' value. It must be a positive number.");
			}

			const response = await fetch(`${this.baseUrl}/booking-types/${page}`, {
				method: "GET",
				headers: this.headers
			});

			if (!response.ok) {
				throw new TidyCalAPIError(
					response.status,
					`API Error in List Booking Types: ${response.status} - ${response.statusText}`);
			}

			// --- Parse and return booking types list ---
			const result = await response.json();
			return result.data as BookingTypeResponse[];

		} catch (error) {
			this.handleError(error, "list booking types");
		}
	}

	/** 
	 * Create a new booking type
	*/
	async create_booking_type(data: {
		title: string;
		description: string;
		duration_minutes: number;
		url_slug: string;
		padding_minutes?: number;
		latest_availability_days?: number;
		private?: boolean;
		max_bookings?: number;
		max_guest_invites_per_booker?: number;
		display_seats_remaining?: boolean;
		booking_availability_interval_minutes?: number;
		redirect_url?: string;
		approval_required?: boolean;
		booking_type_category_id?: number;
	}): Promise<BookingTypeResponse> {
		try {

			//#region field validations
			// validate required field
			const requiredFields = ["title", "description", "duration_minutes", "url_slug"] as const;
			for (const field of requiredFields) {
				if (!data[field]) throw new Error(`Missing required field: '${field}'.`);
			}

			const { title, description, duration_minutes, url_slug } = data;

			if (typeof title !== "string" || title.length > MAX_TITLE_LENGTH)
				throw new Error(`Title must be a string up to ${MAX_TITLE_LENGTH} characters.`);

			if (typeof description !== "string")
				throw new Error("Description must be a valid string containing valid HTML markup.");

			if (typeof duration_minutes !== "number" || duration_minutes < 1)
				throw new Error("Duration minutes must be a positive number.");

			if (typeof url_slug !== "string" || url_slug.length > MAX_TITLE_LENGTH)
				throw new Error(`Url Slug must be a string up to ${MAX_TITLE_LENGTH} characters.`);

			if (data.padding_minutes !== undefined && (typeof data.padding_minutes !== "number" || data.padding_minutes < 0)) {
				throw new Error("'padding_minutes' must be a number greater than or equal to 0.");
			}

			if (data.latest_availability_days !== undefined &&
				(typeof data.latest_availability_days !== "number" || data.latest_availability_days < 0 || data.latest_availability_days > 36500)) {
				throw new Error("'latest_availability_days' must be between 0 and 36500.");
			}

			if (data.private !== undefined && typeof data.private !== "boolean") {
				throw new Error("'private' must be a boolean value.");
			}

			if (data.max_bookings !== undefined && (typeof data.max_bookings !== "number" || data.max_bookings < 1)) {
				throw new Error("'max_bookings' must be a number greater than or equal to 1.");
			}

			if (data.max_guest_invites_per_booker !== undefined &&
				(typeof data.max_guest_invites_per_booker !== "number" || data.max_guest_invites_per_booker < 0 || data.max_guest_invites_per_booker > 10)) {
				throw new Error("'max_guest_invites_per_booker' must be between 0 and 10.");
			}

			if (data.display_seats_remaining !== undefined && typeof data.display_seats_remaining !== "boolean") {
				throw new Error("'display_seats_remaining' must be a boolean value.");
			}

			if (data.booking_availability_interval_minutes !== undefined &&
				(typeof data.booking_availability_interval_minutes !== "number" ||
					data.booking_availability_interval_minutes < 15 || data.booking_availability_interval_minutes > 1440)) {
				throw new Error("'booking_availability_interval_minutes' must be between 15 and 1440 minutes.");
			}

			if (data.redirect_url !== undefined &&
				(typeof data.redirect_url !== "string" || data.redirect_url.length > 60000)) {
				throw new Error("'redirect_url' must be a valid string not exceeding 60000 characters.");
			}

			if (data.approval_required !== undefined && typeof data.approval_required !== "boolean") {
				throw new Error("'approval_required' must be a boolean value.");
			}

			if (data.booking_type_category_id !== undefined &&
				(typeof data.booking_type_category_id !== "number" || data.booking_type_category_id < 0)) {
				throw new Error("'booking_type_category_id' must be a positive integer if provided.");
			}
			//#endregion

			const validators: Record<string, (v: any) => boolean> = {
				padding_minutes: v => typeof v === "number" && v >= 0,
				latest_availability_days: v => typeof v === "number" && v >= 0 && v <= 36500,
				private: v => typeof v === "boolean",
				max_bookings: v => typeof v === "number" && v >= 1,
				max_guest_invites_per_booker: v => typeof v === "number" && v >= 0 && v <= 10,
				display_seats_remaining: v => typeof v === "boolean",
				booking_availability_interval_minutes: v => typeof v === "number" && v >= 15 && v <= 1440,
				redirect_url: v => typeof v === "string" && v.length <= MAX_URL_LENGTH,
				approval_required: v => typeof v === "boolean",
				booking_type_category_id: v => typeof v === "number" && v >= 0
			};

			for (const [key, validator] of Object.entries(validators)) {
				const value = data[key as keyof typeof data];
				if (value !== undefined && !validator(value)) {
					throw new Error(`'${key}' has an invalid value.`);
				}
			}

			const payload: Record<string, any> = {};
			for (const [key, value] of Object.entries(data)) {
				if (value !== undefined) payload[key] = value;
			}

			const response = await fetch(`${this.baseUrl}/booking-types`, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				let errorMsg;
				switch (response.status) {
					case 422:
						errorMsg = "Validation Error";
						break;
					default:
						errorMsg = `API Error in Create Booking Type: ${response.status} - ${response.statusText}`;
						break;
				}
				throw new TidyCalAPIError(response.status, errorMsg);
			}

			const result = await response.json();
			return result.data;

		} catch (error) {
			this.handleError(error, "create booking type");
		}
	}

	/**
	 * List available timeslots
	 */
	async list_available_timeslots(
		bookingTypeId: number,
		params: { starts_at: Date; ends_at: Date }
	): Promise<TimeslotResponse[]> {
		try {
			//#region validations
			// Validate required parameters
			if (!bookingTypeId || typeof bookingTypeId !== "number") {
				throw new Error("Booking Type ID is required and must be a number.");
			}

			if (!(params.starts_at instanceof Date) || isNaN(params.starts_at.getTime())) {
				throw new Error("Invalid start date. It must be a valid Date object.");
			}

			if (!(params.ends_at instanceof Date) || isNaN(params.ends_at.getTime())) {
				throw new Error("Invalid end date. It must be a valid Date object.");
			}
			//#endregion

			const starts_at = params.starts_at.toISOString();
			const ends_at = params.ends_at.toISOString();

			//Construct query parameters
			const query = `?starts_at=${encodeURIComponent(starts_at)}&ends_at=${encodeURIComponent(ends_at)}`;
			const response = await fetch(`${this.baseUrl}/booking-types/${bookingTypeId}/timeslots${query}`, {
				method: "GET",
				headers: this.headers
			});

			if (!response.ok) {
				throw new TidyCalAPIError(response.status,
					`API Error in List Available Timeslots: ${response.status} - ${response.statusText}`
				);
			}

			const result = await response.json();
			return result.data;

		} catch (error) {
			this.handleError(error, "list available timeslots");
		}
	}

	/**
	 * Create a new booking for a specific booking type.
	 */
	async create_booking(
		bookingTypeId: number,
		data: {
			starts_at: Date;
			name: string;
			email: string;
			timezone: string;
			booking_questions?: {
				booking_type_question_id: number;
				answer: string | string[];
			}[];
		}
	): Promise<BookingResponse> {
		try {
			//#region validations
			//validated required parameter
			if (!bookingTypeId || typeof bookingTypeId !== "number")
				throw new Error('Booking Type ID is required and must be a number');
			
			const requiredFields = ["starts_at", "name", "email", "timezone"] as const;
			for (const field of requiredFields) {
				if (!data[field]) throw new Error(`Missing required field: '${field}'.`);
			}
			const { starts_at, name, email, timezone } = data;
	
			if (!(starts_at instanceof Date) || isNaN(starts_at.getTime()))
				throw new Error("Start date must be a valid Date object.");

			if (typeof name !== "string" || name.length > MAX_TITLE_LENGTH)
				throw new Error("Name must be a string not exceeding 191 characters.");
			
			if (typeof email !== "string" || !isValidEmail(email) || email.length > MAX_TITLE_LENGTH)
				throw new Error("Email must be a valid address format not exceeding 191 characters.");
			
			if (typeof timezone !== "string" || timezone.length > MAX_TITLE_LENGTH)
				throw new Error("Timezone must be a valid format not exceeding 191 characters.");
			//#endregion

			//validate optional booking_questions
			if (data.booking_questions !== undefined) {
				if (!Array.isArray(data.booking_questions)) {
					throw new Error("Booking Questions must be an array of question-answer objects.");
				}

				for (const q of data.booking_questions) {
					if (typeof q.booking_type_question_id !== "number")
						throw new Error(
							"Each Booking Question ID item must be a valid integer."
						);

					const answer = q.answer;
					const isValidAnswer =
						typeof answer === "string" ||
						(Array.isArray(answer) && answer.every(a => typeof a === "string"));

					if (!isValidAnswer)
						throw new Error(
							"Each answer in Booking Questions must be either a string or an array of strings."
						);
				}
			}

			const payload: Record<string, any> = {
				starts_at: starts_at.toISOString(),
				name,
				email,
				timezone
			};

			if (Array.isArray(data.booking_questions) && data.booking_questions.length) 
				payload.booking_questions = data.booking_questions;

			const response = await fetch(`${this.baseUrl}/booking-types/${bookingTypeId}/bookings`, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				let errorMsg;
				switch (response.status) {
					case 403:
						errorMsg = "Forbidden - User does not have permission to create bookings for this booking type";
						break;
					case 409:
						errorMsg = "Conflict - The timeslot is not available";
						break;
					case 422:
						errorMsg = "Validation Error";
						break;
					default:
						errorMsg = `API Error in Create Booking: ${response.status} - ${response.statusText}`;
						break;
				}
				throw new TidyCalAPIError(response.status, errorMsg);
			}

			const result = await response.json();
			return result.data;

		} catch (error) {
			this.handleError(error, "create booking");
		}
	}
}

export class TidyCalTeams extends TidyCalAPIBase {
	/**
	 * List all teams available to the user
	 */
	async list_teams(page: number = 1): Promise<TeamResponse[]> {
		try {
			//Validate required parameter
			if (typeof page !== "number" || page <= 0) {
				throw new Error("Invalid page value. It must be a positive number.");
			}

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

	/**
	 * Get details of a specific team by ID
	*/
	async get_team({ team_id }: { team_id: number }): Promise<TeamResponse> {
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

	/**
	 * Get a list of bookings for a specific team.
	 */

	async list_team_bookings({
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

	/**
	 * Get a list of users in a specific team.
	 */
	async list_team_users({ team_id, page }: { team_id: number; page?: number; }): Promise<TeamUserResponse[]> {
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


	/**
	 * Add a user to a team by sending an invitation email.
	 */
	async add_team_user({
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

	/**
	 * Remove a user from a team.
	 */
	async remove_team_user({
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

	/**
	 * Get a list of booking types for a specific team.
	 */
	async list_team_booking_types({
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

	/**
	 * Create a new booking type for a specific team.
	 */
	async create_team_booking_type({
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