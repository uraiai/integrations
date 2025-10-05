import { url } from 'inspector';
import { TidyCalTeams } from './tidycal';

// NOTE: This script is for local testing only. Not used in production.

const tests = {
	async listTeams() {
		console.log('\n📋 Testing List Teams:');
		const teams = await TidyCalTeams.list_teams();
		// console.log("TEAMS:", JSON.stringify(teams, null, 2));
		return teams;
	},

	async getTeamDetails(teamId: number) {
		console.log('\n🔍 Testing Get Team Details:');
		const team = await TidyCalTeams.get_team({ team_id: teamId });
		console.log(JSON.stringify(team, null, 2));
		return team;
	},

	async listTeamBookings(teamId: number) {
		console.log('Testing List Team Bookings:');
		const bookings = await TidyCalTeams.list_team_bookings({
			team_id: teamId,
			// Optional parameters for filtering
			start_date: '2025-10-04',
			// end_date: '2025-10-04',
			email: 'test@example.com',
			// host_id: 320924,
			page: 1
		});
		console.log("Team Bookings:", JSON.stringify(bookings, null, 2));
		return bookings;
	},

	async listTeamUsers(teamId: number, page?: number) {
		console.log('\n👥 Testing List Team Users:');
		const users = await TidyCalTeams.list_team_users({ team_id: teamId, page });
		console.log("List Team Users:", JSON.stringify(users, null, 2));
		return users;
	},
	async addTeamUser(teamId: number, email: string, role: 'admin' | 'user') {
		console.log('\n Testing Add Team User:');
		const result = await TidyCalTeams.add_team_user({
			team_id: teamId,
			email,
			role_name: role
		});
		console.log("Add Team User Result:", JSON.stringify(result, null, 2));
		return result;
	},
	async removeTeamUser(teamId: number, teamUserId: number) {
		console.log('\n Testing Remove Team User:');
		const result = await TidyCalTeams.remove_team_user({
			team_id: teamId,
			team_user_id: teamUserId
		});
		console.log("Remove Team User Result:", JSON.stringify(result, null, 2));
		return result;
	},
	async listTeamBookingTypes(teamId: number, page?: number) {
		console.log('\n Testing List Team Booking Types:');
		const bookingTypes = await TidyCalTeams.list_team_booking_types({ team_id: teamId, page });
		console.log("List Team Booking Types:", JSON.stringify(bookingTypes, null, 2));
		return bookingTypes;
	},
	async createTeamBookingType(teamId: number, bookingTypeData: any) {
		console.log('\n Testing Create Team Booking Type:');
		const newBookingType = await TidyCalTeams.create_team_booking_type({
			team_id: teamId,
			...bookingTypeData
		});
		console.log("Create Team Booking Type Result:", JSON.stringify(newBookingType, null, 2));
		return newBookingType;
	}
};

// Main test runner
async function runTests() {
	try {
		if (!process.env.TIDYCAL_API_KEY) {
			throw new Error('TIDYCAL_API_KEY not set');
		}

		console.log("Starting TidyCal API Tests...");

		// Run list teams test
		const teams = await tests.listTeams();
		console.log("Teams:", JSON.stringify(teams, null, 2));

		// If teams exist, run team details test
		if (teams.length > 0) {
			// await tests.getTeamDetails(teams[0].id);
			// await tests.listTeamBookings(teams[0].id);

			// await tests.addTeamUser(teams[0].id, 'infosandya1998@gmail.com', 'admin');
			// await tests.removeTeamUser(teams[0].id, 20274);
			// await tests.listTeamUsers(teams[0].id);

			await tests.createTeamBookingType(teams[0].id, {
				title: "Consultation Test",
				description: "15-minute consultation",
				duration_minutes: 15,
				url_slug: "consultation",
				max_guest_invites_per_booker: 4,
				display_seats_remaining: true
			});
			await tests.listTeamBookingTypes(teams[0].id);


		}

	} catch (error) {
		console.error('Test failed:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

runTests();