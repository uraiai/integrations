import { TidyCalBookings, TidyCalTeams, TidyCalBookingTypes } from './tidycal.ts';

// NOTE: This script is for local testing only. Not used in production.
// const formatDate = (date: Date) => date.toISOString().split("T")[0];

async function TeamsTest() {
	try {
		const TeamsAPI = new TidyCalTeams(process.env.TIDYCAL_API_KEY!);

		console.log("Starting TidyCal Team Bookings API Tests...");

		const teams = await TeamsAPI.listTeams(1);
		console.log("TEAMS:", JSON.stringify(teams, null, 2));

		if (teams.length > 0) {
			const team = await TeamsAPI.getTeam({ team_id: teams[0].id });
			console.log("GET TEAM:", team);

			const teamBookings = await TeamsAPI.listTeamBookings({ team_id: teams[0].id, page: 1 });
			console.log("TEAM BOOKINGS:", JSON.stringify(teamBookings, null, 2));

			const teamUsers = await TeamsAPI.listTeamUsers({ team_id: teams[0].id, page: 1 });
			console.log("TEAM USERS:", JSON.stringify(teamUsers, null, 2));

			const teamBookingTypes = await TeamsAPI.listTeamBookingTypes({ team_id: teams[0].id, page: 1 });
			console.log("TEAM BOOKING TYPES:", JSON.stringify(teamBookingTypes, null, 2));

			const addedUser = await TeamsAPI.addTeamUser({ team_id: teams[0].id, email: 'test@gmail.com' });
			console.log("ADDED TEAM USER:", JSON.stringify(addedUser, null, 2));

			const removedUser = await TeamsAPI.removeTeamUser({ team_id: teams[0].id, team_user_id: 20401 });
			console.log("REMOVED TEAM USER:", JSON.stringify(removedUser, null, 2));

			const createdBookingType = await TeamsAPI.createTeamBookingTypes({
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


		const BookingsAPI = new TidyCalBookings(process.env.TIDYCAL_API_KEY!);
		const bookings = await BookingsAPI.listBookings({
			// starts_at: new Date("2024-06-01T00:00:00Z"), // ignored
			// ends_at: new Date("2024-06-30T23:59:59Z"),   // ignored
			cancelled: false,                            // ignored
			page: 1,
			include_teams: false,
		});
		console.log("BOOKINGS:", JSON.stringify(bookings, null, 2));


		if (bookings.length > 0) {
			console.log(bookings[0].id);
			const booking = await BookingsAPI.getBooking(bookings[0].id);
			console.log("GET BOOKING:", booking);
		}

		const bookingId = 6679363; // Example booking ID
		const reason = "Test - requested cancellation";

		console.log(`Attempting to cancel booking ID: ${bookingId}`);
		const cancelledBooking = await BookingsAPI.cancelBooking(bookingId, reason);
		console.log("BOOKING CANCELLED SUCCESSFULLY:");
		console.log(JSON.stringify(cancelledBooking, null, 2));


	} catch (error) {
		console.error('Test failed:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

async function BookingTypesTest() {
	try {
		const BookingTypesAPI = new TidyCalBookingTypes(process.env.TIDYCAL_API_KEY!);

		console.log("Starting TidyCal Booking Types API Tests...");

		const booking_types = await BookingTypesAPI.listBookingTypes(1);
		console.log("BOOKING TYPES:", JSON.stringify(booking_types, null, 2));

		const created = await BookingTypesAPI.createBookingType({
			title: "",
			description: "20 Minute Meeting",
			duration_minutes: 20,
			url_slug: `test-20-Minute Meeting`,
			max_guest_invites_per_booker: 20,
			display_seats_remaining: true,
			approval_required: true
		});
		console.log("CREATED BOOKING TYPE:", JSON.stringify(created, null, 2));

		const timeslots = await BookingTypesAPI.listAvailableTimeslots(
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

		const booking = await BookingTypesAPI.createBooking(bookingTypeId, payload);

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
