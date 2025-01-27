import { PartnerCredentials } from './partner.interfaces';
import { BthContext } from '../gateway.interfaces';
import { PartnerAuthServiceException, PartnerServiceException } from './partner.errors';
import assert from 'assert';

/**
 * The PartnerService class provides methods for authenticating requests to the
 * Partner service.
 */
// TODO: translate to portuguese
// TODO: change to auth.service
class PartnerService {
    private partnerAuthUri: string;

    /**
     * Constructor for the PartnerService class.
     */
    constructor() {
        const partnerAuthUri = process.env.PARTNER_AUTH_URI;
        assert(partnerAuthUri, 'ENV PARTNER_AUTH_URI is not defined');
        this.partnerAuthUri = partnerAuthUri;
    }

    /**
     * Gets the partner credentials from the partner service.
     *
     * @param context - The context from the JWT.
     * @returns A promise that resolves to the partner credentials.
     */
    public async getPartnerCredentials(context: BthContext): Promise<PartnerCredentials> {
        // TODO: define how to authenticate with the partner service
        const urlWithParams = this.buildUrlWithParams(context);
        let response: Response;
        try {
            response = await fetch(urlWithParams, this.getRequestOptions());
        } catch (error) {
            throw new PartnerServiceException('An unexpected error occurred', error);
        }

        assert(response.ok, new PartnerAuthServiceException(response.statusText));

        return await this.parseResponseToCredentials(response);
    }

    /**
     * Parses the response object to extract partner credentials.
     *
     * @param response - The response object to parse.
     * @returns An object containing the URI redirect, method, and headers from the partner credentials.
     */
    private async parseResponseToCredentials(response: Response): Promise<PartnerCredentials> {
        const credentials: PartnerCredentials = await response.json();
        assert(
            credentials.uriRedirect,
            new PartnerServiceException('Missing required field: uriRedirect')
        );
        assert(
            credentials.method,
            new PartnerServiceException('Missing required field: uriRedirect')
        );

        return {
            uriRedirect: credentials.uriRedirect,
            method: credentials.method,
            headers: credentials.headers
        };
    }

    /**
     * Generates the request options for an HTTP GET request.
     *
     * @returns {RequestInit} An object containing the request options.
     */
    private getRequestOptions(): RequestInit {
        return {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    /**
     * Constructs a URL with query parameters based on the provided context.
     *
     * @param context - An object containing key-value pairs to be converted into query parameters.
     * @returns A string representing the constructed URL with the appended query parameters.
     */
    private buildUrlWithParams(context: BthContext): string {
        const queryParams = new URLSearchParams(Object.entries(context)).toString();
        return `${this.partnerAuthUri}?${queryParams}`;
    }
}

export { PartnerService };
