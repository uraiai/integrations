// for type definitions	TidyCal API
// Generated from OpenAPI spec by Datamodel Code Generator (
export interface TeamResponse {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface Question {
	id: number;
	booking_id: number;
	question: string;
	answer: string;
	created_at: string;
	updated_at: string;
}

export interface Contact {
	id: number;
	name: string;
	email: string;
	phone_number: string;
	ip_address: string;
	timezone: string;
	created_at: string;
	updated_at: string;
}

export interface Payment {
	id: number;
	payment_id: string;
	booking_id: number;
	amount: number;
	currency: string;
	created_at: string;
	updated_at: string;
}

export interface BookingResponse {
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

export interface TeamUserResponse {
	id: number;
	name: string;
	email: string;
	created_at: string;
	updated_at: string;
}

export interface AddTeamUserResponse {
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

export interface TimeslotResponse {
  starts_at: string;
  ends_at: string;
  available_bookings: number;
}