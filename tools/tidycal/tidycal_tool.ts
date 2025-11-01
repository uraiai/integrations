// import "../../urai.d.ts";
import "./declarations.ts"
import { TidyCalBookingTypes } from "https://cdn.jsdelivr.net/gh/uraiai/integrations/services/tidycal/tidycal.ts";
import dayjs from "https://cdn.jsdelivr.net/npm/dayjs@1/+esm";
import utc from "https://cdn.jsdelivr.net/npm/dayjs@1/plugin/utc.js/+esm";
import timezone from "https://cdn.jsdelivr.net/npm/dayjs@1/plugin/timezone.js/+esm";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Represents the request payload for creating a booking.
 */
interface BookingRequest {
    /** The start time of the booking in local time, in a format like 'YYYY-MM-DD HH:mm:ss' (e.g., '2025-10-10 15:45:00'). */
    starts_at: string;
    /** The name of the person booking. */
    name: string;
    /** The email of the person booking. */
    email: string;
    /** The timezone for the booking (e.g., 'America/New_York'). */
    timezone: string;
}
/**
 * Represents the request payload for listing available timeslots.
 */
interface AvaialbleTimeslotsRequest {
    /** The name of the city to check for available timeslots (e.g., 'New York'). */
    city_name: string;
    /** The start date for the search in ISO 8601 format (e.g., '2025-10-01T00:00:00Z'). Defaults to the current time if not provided. */
    starts_at?: string;
    /** The end date for the search in ISO 8601 format (e.g., '2025-10-17T23:59:59Z'). Defaults to 7 days from the start time if not provided. */
    ends_at?: string;
}

class TidyCalTools {
    /**
     * Create a new booking for a specific booking type in TidyCal.
     */
    @tool
    static async create_booking({ starts_at, name, email, timezone }: BookingRequest) {
        // The 'meta' object is a global provided by the URAI runtime.
        const apiKey = meta.secrets.TIDYCAL_API_KEY;
        if (!apiKey) {
            throw new Error("TIDYCAL_API_KEY secret not found. Please configure it in your environment.");
        }

        const bookingTypesAPI = new TidyCalBookingTypes(apiKey);

        const bookingTypeId = 1516646; // Hardcoded booking type ID

        const booking = await bookingTypesAPI.createBooking(bookingTypeId, {
            starts_at: dayjs.tz(starts_at, timezone).toDate(),
            name,
            email,
            timezone
        });

        return booking;
    }

    /**
     * List available timeslots for a specific booking type in a given city, within a specified date range.
     */
    @tool
    static async list_available_timeslots({ city_name, starts_at, ends_at }: AvaialbleTimeslotsRequest) {
        // The 'meta' object is a global provided by the URAI runtime.
        const apiKey = meta.secrets.TIDYCAL_API_KEY;
        if (!apiKey) {
            throw new Error("TIDYCAL_API_KEY secret not found. Please configure it in your environment.");
        }

        const cityTimezones = await fetchJSON("https://cdn.jsdelivr.net/npm/city-timezones@1.2.0/data/cityMap.json");
        const cityInfo = cityTimezones.find((c: any) => c.city.toLowerCase() === city_name.toLowerCase());

        if (!cityInfo) {
            throw new Error(`Could not find timezone for city: ${city_name}`);
        }
        const cityTz = cityInfo.timezone;

        const bookingTypesAPI = new TidyCalBookingTypes(apiKey);

        const bookingTypeId = 1516646; // Hardcoded booking type ID

        const start = starts_at ? dayjs(starts_at) : dayjs();
        const end = ends_at ? dayjs(ends_at) : start.add(7, 'day');

        const timeslots = await bookingTypesAPI.listAvailableTimeslots(bookingTypeId, {
            starts_at: start.toDate(),
            ends_at: end.toDate()
        });

        const formattedTimeslots = timeslots.map(slot => {
            const localTime = dayjs.utc(slot.starts_at).tz(cityTz);
            return {
                starts_at: localTime.format('YYYY-MM-DD HH:mm:ss'),
                timezone: cityTz,
                available_bookings: slot.available_bookings
            };
        });

        return { timeslots: formattedTimeslots };
    }
}
