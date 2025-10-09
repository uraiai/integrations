import { TidyCalBookingTypes } from 'https://cdn.jsdelivr.net/gh/uraiai/integrations/services/tidycal/tidycal.ts';

const createBookingDeclaration: FunctionDeclaration = {
    name: "create_booking",
    description: "Create a new booking for a specific booking type in TidyCal.",
    parameters: {
        schema_type: "Object",
        properties: {
            starts_at: {
                schema_type: "string",
                description: "The start time of the booking in ISO 8601 format (e.g., '2025-10-10T11:15:00Z')."
            },
            name: {
                schema_type: "string",
                description: "The name of the person booking."
            },
            email: {
                schema_type: "string",
                description: "The email of the person booking."
            },
            timezone: {
                schema_type: "string",
                description: "The timezone for the booking (e.g., 'America/New_York')."
            }
        },
        required: ["starts_at", "name", "email", "timezone"]
    }
};

const listTimeslotsDeclaration: FunctionDeclaration = {
    name: "list_available_timeslots",
    description: "List available timeslots for a specific booking type within a given date range.",
    parameters: {
        schema_type: "Object",
        properties: {
            starts_at: {
                schema_type: "string",
                description: "The start date for the search in ISO 8601 format (e.g., '2025-10-01T00:00:00Z')."
            },
            ends_at: {
                schema_type: "string",
                description: "The end date for the search in ISO 8601 format (e.g., '2025-10-17T23:59:59Z')."
            }
        }
    }
};

ToolRegistry.addDeclarations([createBookingDeclaration, listTimeslotsDeclaration]);
console.log(JSON.stringify([createBookingDeclaration, listTimeslotsDeclaration]));

class TidyCalTools {
    @tool
    static async create_booking({
        starts_at,
        name,
        email,
        timezone
    }: {
        starts_at: string;
        name: string;
        email: string;
        timezone: string;
    }) {
        // The 'meta' object is a global provided by the URAI runtime.
        const apiKey = meta.secrets.TIDYCAL_API_KEY;
        if (!apiKey) {
            throw new Error("TIDYCAL_API_KEY secret not found. Please configure it in your environment.");
        }

        const bookingTypesAPI = new TidyCalBookingTypes(apiKey);

        const bookingTypeId = 1516646; // Hardcoded booking type ID

        const booking = await bookingTypesAPI.createBooking(bookingTypeId, {
            starts_at: new Date(starts_at),
            name,
            email,
            timezone
        });

        return booking;
    }

    @tool
    static async list_available_timeslots({
        starts_at,
        ends_at
    }: {
        starts_at?: string;
        ends_at?: string;
    }) {
        // The 'meta' object is a global provided by the URAI runtime.
        const apiKey = meta.secrets.TIDYCAL_API_KEY;
        if (!apiKey) {
            throw new Error("TIDYCAL_API_KEY secret not found. Please configure it in your environment.");
        }

        const bookingTypesAPI = new TidyCalBookingTypes(apiKey);

        const bookingTypeId = 1516646; // Hardcoded booking type ID

        const start = starts_at ? new Date(starts_at) : new Date();
        const end = ends_at ? new Date(ends_at) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

        const timeslots = await bookingTypesAPI.listAvailableTimeslots(bookingTypeId, {
            starts_at: start,
            ends_at: end
        });

        return {timeslots: timeslots};
    }
}
