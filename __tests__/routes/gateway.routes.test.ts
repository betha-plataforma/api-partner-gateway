import request from "supertest";
import * as jose from "node-jose";
import app from "../../src/app";
import { GatewayController } from "../../src/gateway/gateway.cotroller";
import { jest } from "@jest/globals";

/**
 * Tests for the gateway routes.
 */
describe("Gateway routes", () => {
    let keystore: jose.JWK.KeyStore;
    let key: jose.JWK.Key;

    /**
     * Generate a key before running the tests.
     */
    beforeAll(async () => {
        keystore = jose.JWK.createKeyStore();
        key = await keystore.generate("oct", 256, { alg: "HS256", use: "sig" });
    });

    /**
     * Reset the mocks after each test.
     */
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Get gateway", async () => {
        const payload = { userId: "12345", role: "admin" };
        const token = await jose.JWS.createSign(
            { format: "compact", fields: { typ: "JWT" } },
            key
        )
            .update(JSON.stringify(payload))
            .final();

        const res = await request(app)
            .post("/partner-gateway/v1/auth")
            .send({ token });

        expect(res.text).toEqual("redirected");
        expect(res.status).toBe(200);
    });

    test("Get gateway with missing token", async () => {
        const res = await request(app)
            .post("/partner-gateway/v1/auth");

        expect(res.status).toBe(422);
        expect(res.body).toEqual({
            errors: [
                {
                    type: "field",
                    path: "token",
                    msg: "Invalid JWT token",
                    location: "body"
                },
                {
                    location: "body",
                    msg: "Invalid JWT token",
                    path: "token",
                    type: "field"
                }
            ]
        });
    });

    test("Get gateway with invalid token", async () => {
        const res = await request(app)
            .post("/partner-gateway/v1/auth")
            .send({ token: "invalid-token" });

        expect(res.status).toBe(422);
        expect(res.body).toEqual({
            errors: [
                {
                    type: "field",
                    msg: "Invalid JWT token",
                    path: "token",
                    location: "body",
                    value: "invalid-token"
                }
            ]
        });
    });

    test("Handles unexpected errors gracefully", async () => {
        jest.spyOn(GatewayController.prototype, "auth").mockImplementationOnce(function () {
            throw new Error("Unexpected server error");
        });

        const res = await request(app)
            .post("/partner-gateway/v1/auth")
            .send({ token: "valid-token" });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({});
    });
});