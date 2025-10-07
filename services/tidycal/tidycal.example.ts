import { TidyCalBookings, TidyCalTeams, TidyCalBookingTypes } from './tidycal';

// NOTE: This script is for local testing only. Not used in production.
// const formatDate = (date: Date) => date.toISOString().split("T")[0];

async function TeamsTest() {
	try {
		const TeamsAPI = new TidyCalTeams();

		console.log("Starting TidyCal Team Bookings API Tests...");

		const teams = await TeamsAPI.list_teams(1);
		console.log("TEAMS:", JSON.stringify(teams, null, 2));

		if (teams.length > 0) {
			const team = await TeamsAPI.get_team({ team_id: teams[0].id });
			console.log("GET TEAM:", team);

			const teamBookings = await TeamsAPI.list_team_bookings({ team_id: teams[0].id, page: 1 });
			console.log("TEAM BOOKINGS:", JSON.stringify(teamBookings, null, 2));

			const teamUsers = await TeamsAPI.list_team_users({ team_id: teams[0].id, page: 1 });
			console.log("TEAM USERS:", JSON.stringify(teamUsers, null, 2));

			const teamBookingTypes = await TeamsAPI.list_team_booking_types({ team_id: teams[0].id, page: 1 });
			console.log("TEAM BOOKING TYPES:", JSON.stringify(teamBookingTypes, null, 2));

			const addedUser = await TeamsAPI.add_team_user({ team_id: teams[0].id, email: 'test@gmail.com' });
			console.log("ADDED TEAM USER:", JSON.stringify(addedUser, null, 2));

			const removedUser = await TeamsAPI.remove_team_user({ team_id: teams[0].id, team_user_id: 20401 });
			console.log("REMOVED TEAM USER:", JSON.stringify(removedUser, null, 2));

			const createdBookingType = await TeamsAPI.create_team_booking_type({
				team_id: teams[0].id,
				title: "20 minutes meeting Test",
				description: "20-minute consultation",
				duration_minutes: 20,
				url_slug: "20-mins-meeting-test",
				max_guest_invites_per_booker: 7, // Invalid value to test error handling
				display_seats_remaining: true,
				latest_availability_days: 36501, // Invalid value to test error handling
				booking_availability_interval_minutes: 10 // Invalid value to test error handling
			});
			console.log("CREATED TEAM BOOKING TYPE:", JSON.stringify(createdBookingType, null, 2));
		}
	} catch (error) {
		console.error('Test failed:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

async function BookingsTest() {
	try {

		console.log("Starting TidyCal Bookings API Tests...");


		const BookingsAPI = new TidyCalBookings();
		const bookings = await BookingsAPI.list_bookings({
			// starts_at: new Date("2024-06-01T00:00:00Z"), // ignored
			// ends_at: new Date("2024-06-30T23:59:59Z"),   // ignored
			cancelled: false,                            // ignored
			page: 1,
			include_teams: false,
		});
		console.log("BOOKINGS:", JSON.stringify(bookings, null, 2));


		if (bookings.length > 0) {
			console.log(bookings[0].id);
			const booking = await BookingsAPI.get_booking(bookings[0].id);
			console.log("GET BOOKING:", booking);
		}

		const bookingId = 6679363; // Example booking ID
		const reason = "Test - requested cancellation";

		console.log(`Attempting to cancel booking ID: ${bookingId}`);
		const cancelledBooking = await BookingsAPI.cancel_booking(bookingId, reason);
		console.log("BOOKING CANCELLED SUCCESSFULLY:");
		console.log(JSON.stringify(cancelledBooking, null, 2));


	} catch (error) {
		console.error('Test failed:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

async function BookingTypesTest() {
	try {
		const BookingTypesAPI = new TidyCalBookingTypes();

		console.log("Starting TidyCal Booking Types API Tests...");

		const booking_types = await BookingTypesAPI.list_booking_types(1);
		console.log("BOOKING TYPES:", JSON.stringify(booking_types, null, 2));

		const created = await BookingTypesAPI.create_booking_type({
			title: "",
			description: "20 Minute Meeting",
			duration_minutes: 20,
			url_slug: `test-20-Minute Meeting`,
			max_guest_invites_per_booker: 20,
			display_seats_remaining: true,
			approval_required: true
		});
		console.log("CREATED BOOKING TYPE:", JSON.stringify(created, null, 2));

		const timeslots = await BookingTypesAPI.list_available_timeslots(
			1516648, // booking_type_id (path param)
			{
				starts_at: new Date("2025-10-01T00:00:00Z"),
				ends_at: new Date("2025-10-17T23:59:59Z"),
			}
		);
		console.log("AVAILABLE TIMESLOTS:", JSON.stringify(timeslots, null, 2));

		const bookingTypeId = 1516646; // Replace with your valid Booking Type ID
		const payload = {
			starts_at: new Date("2025-10-10T11:15:00Z"), // Must match one of the available timeslots
			name: "Test Booking from API",
			email: "sandyasadasivam01@gmail.com",
			timezone: "America/Moncton",
		};

		console.log("Creating booking with payload:", payload);

		const booking = await BookingTypesAPI.create_booking(bookingTypeId, payload);

		console.log("BOOKING CREATED SUCCESSFULLY:");
		console.log(JSON.stringify(booking, null, 2));
	} catch (error) {
		console.error('Test failed:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

// TeamsTest();
// BookingsTest();
// BookingTypesTest();