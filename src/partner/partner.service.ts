import { PartnerCredentials } from "./partner-credentials.interface";
import { RequestContext } from "../gateway/request-context.interface";
import {
    PartnerClientErrorException,
    PartnerServerErrorException,
    PartnerUnexpectedErrorException,
    PartnerServiceException
} from "../partner/partner.errors";

/**
 * The PartnerService class provides methods for authenticating requests to the
 * Partner service.
 */
class PartnerService {
    private partnerAuthUri: string;

    /**
     * Constructor for the PartnerService class.
     */
    constructor() {
        const partnerAuthUri = process.env.PARTNER_AUTH_URI;
        if (!partnerAuthUri) throw new Error("ENV PARTNER_AUTH_URI is not defined");
        this.partnerAuthUri = partnerAuthUri;
    }

    /**
     * Gets the partner credentials from the partner service.
     * 
     * @param context - The context from the JWT.
     * @returns A promise that resolves to the partner credentials.
     */
    public async getPartnerCredentials(context: RequestContext): Promise<PartnerCredentials> {
        return fetch(this.partnerAuthUri, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(context)
        }).then(response => {
            if (!response?.ok) {
                if (response.status >= 400 && response.status < 500) {
                    throw new PartnerClientErrorException(
                        `Client error: ${response.status} - ${response.statusText}`, response.status
                    );
                } else if (response.status >= 500) {
                    throw new PartnerServerErrorException(
                        `Server error: ${response.status} - ${response.statusText}`, response.status
                    );
                } else {
                    throw new PartnerUnexpectedErrorException(
                        `Unexpected error: ${response.status} - ${response.statusText}`, response.status
                    );
                }
            }
            return response.json();
        }).then(data => {
            return data as PartnerCredentials;
        }).catch(error => {
            if (error instanceof
                PartnerClientErrorException ||
                PartnerServerErrorException ||
                PartnerUnexpectedErrorException) {
                throw error;
            }

            throw new PartnerServiceException(error.message);
        });
    }
}

export { PartnerService };
