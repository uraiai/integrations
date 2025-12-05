const BREVO_BASE_URL = 'https://api.brevo.com/v3';

export interface CreateDealRequest {
    name: string;
    linkedContactsIds: [number];
    pipelineId: string;
    dealStage: string;
}

export class BrevoApi {
    apiKey: string;
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    async saveContact(email: string, listID: number) {
        const url = `${BREVO_BASE_URL}/contacts`;
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'api-key': this.apiKey
            },
            body: JSON.stringify({ listIds: [listID], updateEnabled: true, email })
        };
        const resp = await fetch(url, options);
        if(resp.status == 204) {
            return this.fetchContactByEmail(email);
        }
        const retVal = await resp.json();
        console.log('saveContact response:', retVal);
        return retVal;
    }

    async fetchContactByEmail(email: string) {
        const encodedEmail = encodeURIComponent(email);
        const url = `${BREVO_BASE_URL}/contacts/${encodedEmail}?identifierType=email_id`;
        console.log('fetchContactByEmail url:', url);
        const options = {
            method: 'GET',
            headers: {
            accept: 'application/json',
            'api-key': this.apiKey
            }
        };
        const resp = await fetch(url, options);
        const retVal = await resp.json();
        console.log('fetchContactByEmail response:', retVal);
        return retVal;
    }
    async createDeal(dealReq: CreateDealRequest) {
        const url = `${BREVO_BASE_URL}/crm/deals`;
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'api-key': this.apiKey
            },
            body: JSON.stringify(dealReq)
        };
        const resp = await fetch(url, options);
        const retVal = await resp.json();
        console.log('createDeal response:', retVal);
        return retVal;
    }
    async getPipelineDetails(pipelineID: string) {
        const url = `${BREVO_BASE_URL}/crm/pipeline/details/${pipelineID}`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'api-key': this.apiKey,
                'content-type': 'application/json',
            },
        }
        const resp = await fetch(url, options);
        return resp.json();

    }
}
