import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.88.0/+esm'

import _declarations from './declarations';
const d = _declarations

/** * Represents the request payload for creating a reservation */
interface ReservationRequest {
    /** Name of the guest making the reservation */
    guest_name: string;
    /** Number of people for the reservation */
    number_people: number;
    /** Company name associated with the reservation */
    company_name: string;
    /** Type of hall requested for the reservation */
    hall_type: string;
    /** Any special requests for the reservation */
    special_requests: string;
    /** Phone number of the caller making the reservation */
    caller_number: string;
    /** Start time of the reservation in ISO 8601 format in UTC */
    start_time: string;
}

class ReservationUtils {
    supabaseClient: any;
    constructor(project: string, apiKey: string) {
        this.supabaseClient = createClient(project, apiKey); 
    }
    async createReservation(reservationData: ReservationRequest) {
        return await this.supabaseClient.from('reservations').insert([reservationData]).select();
    }
}

class SupabaseReservations {
    /** Create a new reservation in the Supabase database */
    @tool
    async create_reservation(reservationData: ReservationRequest) {
        const project = meta.vars.metadata.supabase_project;
        const apiKey = meta.secrets.SUPABASE_API_KEY;
        const client = new ReservationUtils(project, apiKey!);
        const resp = await client.createReservation(reservationData);
        return resp
    }
}


