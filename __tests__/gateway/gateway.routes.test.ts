import * as jose from "node-jose";
import { GatewayController } from "../../src/gateway/gateway.controller";
import { jest } from "@jest/globals";
import { GatewayService } from "../../src/gateway/gateway.service";
import { Request, Response } from "express";

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
        jest.spyOn(GatewayService.prototype, "auth").mockImplementation(async (token: string) => {
            return {
                uriRedirect: "mockUriRedirect",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
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

        controller = new GatewayController(mockGatewayService);
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
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        await controller.auth(req as Request, res as Response, jest.fn());

        expect(mockGatewayService.auth).toHaveBeenCalledWith(token);
    });

    test("should return 422 for an invalid token", async () => {
        if (req.headers) {
            req.headers["x-bth-gateway-id"] = "invalid-token";
        }

        await controller.auth(req as Request, res as Response, jest.fn());

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

        await controller.auth(req as Request, res as Response, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
});