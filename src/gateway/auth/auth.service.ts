import { AuthCredentials } from './auth.interfaces';
import { BthContext } from '../gateway.interfaces';
import { AuthServiceRequestException, AuthServiceException } from './auth.errors';
import assert from 'assert';

/**
 * The AuthService class provides methods for authenticating requests to the
 * Auth service.
 */
// TODO: translate to portuguese
// TODO: change to auth.service
class AuthService {
    private authUri: string;

    /**
     * Constructor for the AuthService class.
     */
    constructor() {
        const authUri = process.env.AUTH_URI;
        assert(authUri, 'ENV AUTH_URI is not defined');
        this.authUri = authUri;
    }

    /**
     * Gets the auth credentials from the auth service.
     *
     * @param context - The context from the JWT.
     * @returns A promise that resolves to the auth credentials.
     */
    public async getAuthCredentials(context: BthContext): Promise<AuthCredentials> {
        // TODO: define how to authenticate with the auth service
        const urlWithParams = this.buildUrlWithParams(context);
        let response: Response;
        try {
            response = await fetch(urlWithParams, this.getRequestOptions());
        } catch (error) {
            throw new AuthServiceException('An unexpected error occurred', error);
        }

        assert(response.ok, new AuthServiceRequestException(response.statusText));

        return await this.parseResponseToCredentials(response);
    }

    /**
     * Parses the response object to extract auth credentials.
     *
     * @param response - The response object to parse.
     * @returns An object containing the URI redirect, method, and headers from the auth credentials.
     */
    private async parseResponseToCredentials(response: Response): Promise<AuthCredentials> {
        const credentials: AuthCredentials = await response.json();
        assert(
            credentials.uriRedirect,
            new AuthServiceException('Missing required field: uriRedirect')
        );
        assert(credentials.method, new AuthServiceException('Missing required field: uriRedirect'));

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
        return `${this.authUri}?${queryParams}`;
    }
}

export { AuthService };
