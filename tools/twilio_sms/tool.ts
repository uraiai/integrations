import _declarations from './declarations';
const d = _declarations
async function sendSMS({toNumber, body}: {toNumber: string, body: string | undefined}) {
    console.log('Sending SMS to:', toNumber);
    const accountSid = meta.secrets.TWILIO_ACCOUNT_SID;
    const authToken = meta.secrets.TWILIO_ACCOUNT_AUTH
    const twilioNumber = meta.secrets.TWILIO_OUTGOING_NUMBER;
    console.log(meta.vars)

    const messageBody = body || meta.vars.metadata.message_body ||  "Thank you for your call."
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', toNumber);
    formData.append('From', twilioNumber!);
    formData.append('Body', messageBody);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

/**
 * Represents the request payload for notifying users
 */
interface MessageRequest {
    /** The recipient's phone number */
    to_number: string;
}

/**
 * Represents the request payload for notifying users
 */
interface MessageRequestWithBody {
    /** The recipient's phone number */
    to_number: string;
    /** The message to send to the recepient */
    body: string;
}

class TwilioTools {
    /**
    * Send SMS using Twilio API
    */
    @tool
    static async send_sms({ to_number }: MessageRequest) {
        return await sendSMS({toNumber: to_number});
    }
    /**
    * Send SMS using Twilio API with a body
    */
    @tool
    static async send_sms_with_body({ to_number, body }: MessageRequestWithBody) {
        return await sendSMS({toNumber: to_number, body});
    }
}

