import {BrevoApi} from "./library"
import d from './declarations';
// This unused variable is to ensure that the declarations module is included
const _f = d;

interface SaveContactRequest {
    /** The contact's email address */
    email: string;
}

class BrevoTools {
    /**
    * Save contact to Brevo list and creates a deal
    */
    @tool
    static async save_contact({ email }: SaveContactRequest) {
        const brevoApiKey = meta.secrets.BREVO_API_KEY;

        const listID = meta.vars.metadata.BREVO_LIST_ID;
        const dealStageID = meta.vars.metadata.BREVO_DEAL_STAGE_ID;
        const pipelineID = meta.vars.metadata.BREVO_PIPELINE_ID;

        const brevoApi = new BrevoApi(brevoApiKey!);
        const contact = await brevoApi.saveContact(email, listID);
        return await brevoApi.createDeal({
            name: `Deal for ${email}`,
            linkedContactsIds: [contact.id],
            pipelineId: pipelineID,
            dealStage: dealStageID
        });
    }
}
