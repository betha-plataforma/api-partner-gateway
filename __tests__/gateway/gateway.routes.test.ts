import request from "supertest";
import * as jose from "node-jose";
import { GatewayController } from "../../src/gateway/gateway.cotroller";
import { jest } from "@jest/globals";
import { GatewayService } from "../../src/gateway/gateway.service";
import { Request, Response } from "express";

/**
 * Tests for the gateway routes.
 */
describe("Gateway routes", () => {
    let keystore: jose.JWK.KeyStore;
    let key: jose.JWK.Key;
    let mockGatewayService: jest.Mocked<GatewayService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let controller: GatewayController;

    beforeAll(async () => {
        keystore = jose.JWK.createKeyStore();
        key = await keystore.generate("oct", 256, { alg: "HS256", use: "sig" });
    });

    beforeEach(() => {
        mockGatewayService = {
            auth: jest.fn(),
        } as unknown as jest.Mocked<GatewayService>;
        jest.spyOn(GatewayService.prototype, "auth").mockImplementation(async () => {
            return {
                uriRedirect: "mockUriRedirect",
                token: "mockToken"
            };
        });

        req = {
            headers: {},
            body: {},
        } as unknown as Partial<Request>;

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
        } as unknown as Partial<Response>;

        controller = new GatewayController(req as Request, res as Response, mockGatewayService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should return 200 for a valid token", async () => {
        const payload = { user: "test-user" };
        const token = await jose.JWS.createSign({ format: "compact", fields: { alg: "HS256" } }, key)
            .update(JSON.stringify(payload))
            .final();
        req.headers = { "x-bth-gateway-id": token as unknown as string };

        mockGatewayService.auth.mockResolvedValueOnce({
            uriRedirect: "mockUriRedirect",
            token: "mockToken"
        });

        await controller.auth();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith("redirected");
        expect(mockGatewayService.auth).toHaveBeenCalledWith(req as Request);
    });

    test("should return 422 for an invalid token", async () => {
        if (req.headers) {
            req.headers["x-bth-gateway-id"] = "invalid-token";
        }

        await controller.auth();

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.anything(),
            })
        );
    });

    test("should return 500 for unexpected errors", async () => {
        const payload = { user: "test-user" };
        const token = await jose.JWS.createSign({ format: "compact", fields: { alg: "HS256" } }, key)
            .update(JSON.stringify(payload))
            .final();
        req.headers = { "x-bth-gateway-id": token as unknown as string };

        mockGatewayService.auth.mockImplementationOnce(() => {
            throw new Error("Unexpected server error");
        });

        await controller.auth();

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
});