import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm'

// These two lines are mandatory and should be in every file. 
import _declarations from './declarations';
const d = _declarations;

/** 
 * Represents the structured health conditions reported by the patient
 */
interface HealthConditions {
    /** Does the patient have high blood pressure? (e.g., 'yes', 'no', 'not sure') */
    high_blood_pressure: string | null;
    /** Does the patient have heart disease? */
    heart_disease: string | null;
    /** Does the patient have diabetes? */
    diabetes: string | null;
    /** Has the patient ever had a stroke? */
    stroke: string | null;
    /** Does the patient have Parkinson's disease? */
    parkinsons_disease: string | null;
    /** Does the patient experience balance problems? */
    balance_problems: string | null;
}

/** 
 * Represents the complete dementia screening report collected during the call
 */
interface ScreeningReport {
    /** The patient's first name */
    first_name: string;
    /** The patient's last name */
    last_name: string;
    /** The patient's date of birth in ISO format (YYYY-MM-DD) */
    date_of_birth: string;
    /** The sex assigned to the patient at birth */
    sex_assigned_at_birth: string;
    /** The patient's highest level of education completed */
    level_of_education: string;
    /** The caller's response when asked for the current year */
    orientation_year_response: string;
    /** The caller's response when asked for the current month */
    orientation_month_response: string;
    /** The caller's response when asked for today's date */
    orientation_date_response: string;
    /** The caller's response when asked to identify their current location or building */
    orientation_place_response: string;
    /** Object containing the patient's reported chronic health conditions */
    health_conditions: HealthConditions;
    /** The sequence of digits read to the caller for the forward span test */
    digit_span_forward_provided: string;
    /** The caller's attempt to repeat the forward digits in the same order */
    digit_span_forward_response: string;
    /** The sequence of digits read to the caller for the reverse span test */
    digit_span_reverse_provided: string;
    /** The caller's attempt to repeat the reverse digits in backwards order */
    digit_span_reverse_response: string;
    /** The specific reason for escalating to a human, if applicable (e.g., 'Significant disorientation') */
    transfer_reason?: string;
    /** Boolean flag indicating if the caller met escalation criteria and was transferred to a human agent */
    is_transferred: boolean;
}

/**
 * Internal utility for interacting with the Supabase database
 */
class MedavieDatabaseClient {
    supabaseClient: any;

    constructor(project: string, apiKey: string) {
        this.supabaseClient = createClient(project, apiKey);
    }

    /**
     * Inserts the report into the 'dementia_screenings' table
     */
    async logScreening(report: ScreeningReport) {
        const { data, error } = await this.supabaseClient
            .from('dementia_screenings')
            .insert([{
                first_name: report.first_name,
                last_name: report.last_name,
                transfer_reason: report.transfer_reason || null,
                transferred: report.is_transferred,
                screening_data: report // The full object stored in JSONB
            }])
            .select();

        if (error) throw error;
        return data;
    }
}

/**
 * Tools for the Medavie Dementia Screening Agent to persist session data
 */
class MedavieTools {
    /**
     * Saves the complete dementia screening report to the Medavie database.
     * This tool should be called at the end of the interview process, or immediately before 
     * transferring the call to a human agent if escalation criteria are met.
     */
    @tool
    async save_screening_report(report: ScreeningReport) {
        const project = meta.vars.metadata.supabase_project;
        const apiKey = meta.secrets.MEDAVIE_SB_KEY;

        if (!project || !apiKey) {
            return { error: "Supabase configuration missing in meta.vars or meta.secrets" };
        }

        const db = new MedavieDatabaseClient(project, apiKey);

        try {
            const result = await db.logScreening(report);
            return {
                status: "success",
                message: "Screening report archived successfully",
                record_id: result[0]?.id
            };
        } catch (error: any) {
            return {
                status: "error",
                message: error.message
            };
        }
    }
}