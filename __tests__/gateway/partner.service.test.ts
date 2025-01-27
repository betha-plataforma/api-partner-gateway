import { PartnerService } from "../../src/partner/partner.service";
import {
    PartnerClientErrorException,
    PartnerServerErrorException,
    PartnerUnexpectedErrorException
} from "../../src/partner/partner.errors";
import { RequestContext } from "../../src/gateway/request-context.interface";

global.fetch = jest.fn();

describe('PartnerService', () => {
    let partnerService: PartnerService;
    const mockContext: RequestContext = {
        database: 'testDB',
        entity: 'user',
        system: 'auth'
    };

    beforeEach(() => {
        process.env.PARTNER_AUTH_URI = 'http://localhost:3000/mock/partner/auth';
        partnerService = new PartnerService();
        jest.clearAllMocks();
    });

    afterEach(() => {
        delete process.env.PARTNER_AUTH_URI;
    });

    test('should successfully get partner credentials', async () => {
        const mockResponse = {
            ok: true,
            status: 200,
            json: () => Promise.resolve({
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret'
            })
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        const credentials = await partnerService.getPartnerCredentials(mockContext);

        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:3000/mock/partner/auth',
            expect.objectContaining({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        );
        expect(credentials).toEqual({
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret'
        });
    });

    test('should throw PartnerClientErrorException for 4xx errors', async () => {
        const mockResponse = {
            ok: false,
            status: 400,
            statusText: 'Bad Request'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(partnerService.getPartnerCredentials(mockContext))
            .rejects
            .toThrow(PartnerClientErrorException);
    });

    test('should throw PartnerServerErrorException for 5xx errors', async () => {
        const mockResponse = {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(partnerService.getPartnerCredentials(mockContext))
            .rejects
            .toThrow(PartnerServerErrorException);
    });

    test('should throw PartnerUnexpectedErrorException for other status codes', async () => {
        const mockResponse = {
            ok: false,
            status: 300,
            statusText: 'Multiple Choices'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(partnerService.getPartnerCredentials(mockContext))
            .rejects
            .toThrow(PartnerUnexpectedErrorException);
    });

    test('should throw Error when PARTNER_AUTH_URI is not defined', () => {
        delete process.env.PARTNER_AUTH_URI;

        expect(() => new PartnerService())
            .toThrow('ENV PARTNER_AUTH_URI is not defined');
    });
});