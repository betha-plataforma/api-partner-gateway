import { PartnerCredentials } from "./partner-credentials.interface";
import { BthContext } from "../gateway/bth-context.interface";
import {
    PartnerAuthServiceException,
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
    public async getPartnerCredentials(context: BthContext): Promise<PartnerCredentials> {
        const queryParams = new URLSearchParams(Object.entries(context)).toString();
        const urlWithParams = `${this.partnerAuthUri}?${queryParams}`;
        let response: Response;
        try {
            response = await fetch(urlWithParams, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
        } catch (error) {
            throw new PartnerServiceException("An unexpected error occurred", error);
        }

        if (!response.ok) {
            throw new PartnerAuthServiceException(response.statusText);
        }

        return await response.json() as PartnerCredentials;
    }
}

export { PartnerService };
