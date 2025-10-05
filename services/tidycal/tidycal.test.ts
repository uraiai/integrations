import { TidyCalTeams } from './tidycal';

// NOTE: This script is for local testing only. Not used in production.

const tests = {
    async listTeams() {
        console.log('\n📋 Testing List Teams:');
        const teams = await TidyCalTeams.list_teams();
        // console.log("TEAMS:", JSON.stringify(teams, null, 2));
        return teams;
    },

    // async getTeamDetails(teamId: number) {
    //     console.log('\n🔍 Testing Get Team Details:');
    //     const team = await TidyCalTeams.get_team({ team_id: teamId });
    //     console.log(JSON.stringify(team, null, 2));
    //     return team;
    // }
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
        // if (teams.length > 0) {
        //     await tests.getTeamDetails(teams[0].id);
        // }

    } catch (error) {
        console.error('Test failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

runTests();