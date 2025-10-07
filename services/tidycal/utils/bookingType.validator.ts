export const MAX_TITLE_LENGTH = 255;
export const MAX_URL_LENGTH = 60000;

/**
 * Validates the fields for booking type creation (used by both team and individual booking types).
 * Throws an Error if any validation fails.
 */
export function validateBookingTypeData(data: Record<string, any>): void {
	
	if (!data) throw new Error("Data payload is required.");
	
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
		throw new Error("'duration_minutes' must be a positive number.");

	if (typeof url_slug !== "string" || url_slug.length > MAX_TITLE_LENGTH)
		throw new Error(`'url_slug' must be a string up to ${MAX_TITLE_LENGTH} characters.`);

	if (data.padding_minutes !== undefined && (typeof data.padding_minutes !== "number" || data.padding_minutes < 0)) {
		throw new Error("'padding_minutes' must be a number greater than or equal to 0.");
	}

	if (data.latest_availability_days !== undefined &&
		(typeof data.latest_availability_days !== "number" || data.latest_availability_days < 0 || data.latest_availability_days > 36500)) {
		throw new Error("'latest_availability_days' must be between 0 and 36500.");
	}

	if (data.private !== undefined && typeof data.private !== "boolean")
		throw new Error("'private' must be a boolean value.");
	

	if (data.max_bookings !== undefined && (typeof data.max_bookings !== "number" || data.max_bookings < 1))
		throw new Error("'max_bookings' must be a number greater than or equal to 1.");
	

	if (data.max_guest_invites_per_booker !== undefined &&
		(typeof data.max_guest_invites_per_booker !== "number" || data.max_guest_invites_per_booker < 0 || data.max_guest_invites_per_booker > 10)) {
		throw new Error("'max_guest_invites_per_booker' must be between 0 and 10.");
	}

	if (data.display_seats_remaining !== undefined && typeof data.display_seats_remaining !== "boolean")
		throw new Error("'display_seats_remaining' must be a boolean value.");
	

	if (data.booking_availability_interval_minutes !== undefined &&
		(typeof data.booking_availability_interval_minutes !== "number" ||
			data.booking_availability_interval_minutes < 15 || data.booking_availability_interval_minutes > 1440)) {
		throw new Error("'booking_availability_interval_minutes' must be between 15 and 1440 minutes.");
	}

	if (data.redirect_url !== undefined &&
		(typeof data.redirect_url !== "string" || data.redirect_url.length > 60000)) {
		throw new Error("'redirect_url' must be a valid string not exceeding 60000 characters.");
	}

	if (data.approval_required !== undefined && typeof data.approval_required !== "boolean")
		throw new Error("'approval_required' must be a boolean value.");
	

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
}