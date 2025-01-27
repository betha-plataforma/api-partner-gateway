import jwt from 'jsonwebtoken';
import { GatewayController } from '../gateway.controller';
import { jest } from '@jest/globals';
import { GatewayService } from '../gateway.service';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';

describe('Gateway routes', () => {
    let secretKey: string;
    let mockGatewayService: jest.Mocked<GatewayService>;
    let mockAuthService: jest.Mocked<AuthService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let controller: GatewayController;

    beforeAll(() => {
        secretKey = 'test-secret-key-256-bits-long';
    });

    beforeEach(() => {
        mockGatewayService = {
            getContext: jest.fn()
        } as unknown as jest.Mocked<GatewayService>;

        mockAuthService = {
            getCredentials: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        req = {
            headers: {}
        } as unknown as Partial<Request>;

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        } as unknown as Partial<Response>;

        controller = new GatewayController(mockGatewayService, mockAuthService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should return 200 for a valid token', async () => {
        const payload = { user: 'test-user' };
        const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });

        req.headers = { 'x-bth-gateway-id': token };

        jest.spyOn(GatewayService.prototype, 'getContext').mockImplementation(async () => {
            return {
                database: 'database',
                entity: 'entity',
                system: 'system'
            };
        });

        jest.spyOn(AuthService.prototype, 'getCredentials').mockImplementation(async () => {
            return {
                uriRedirect: 'mockUriRedirect',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        });

        await controller.auth(req as Request, res as Response, jest.fn());

        expect(mockGatewayService.getContext).toHaveBeenCalledWith(token);
    });

    test('should return 422 for an invalid token', async () => {
        if (req.headers) {
            req.headers['x-bth-gateway-id'] = 'invalid-token';
        }

        await controller.auth(req as Request, res as Response, jest.fn());

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.anything()
            })
        );
    });

    test('should return 500 for unexpected errors', async () => {
        const payload = { user: 'test-user' };
        const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });

        req.headers = { 'x-bth-gateway-id': token };

        mockGatewayService.getContext.mockImplementationOnce(() => {
            throw new Error('Unexpected server error');
        });

        await controller.auth(req as Request, res as Response, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
});
