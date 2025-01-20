import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import { GatewayService } from "../../src/gateway/gateway.service";
import { InvalidTokenException } from "../../src/gateway/gateway.errors";

jest.mock("jwks-rsa");
jest.mock("jsonwebtoken");

describe("GatewayService", () => {
    const mockJwksClient = {
        getSigningKey: jest.fn()
    };

    beforeAll(() => {
        process.env.JWKS_URI = "https://example.com/.well-known/jwks.json";
        (jwksRsa as unknown as jest.Mock).mockImplementation(() => mockJwksClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should validate a JWT successfully", async () => {
        const mockPublicKey = "mock-public-key";
        const mockPayload = { userId: "12345", role: "admin" };

        const token = "header.payload.signature";
        const decodedHeader = { kid: "test-kid", alg: "RS256" };

        mockJwksClient.getSigningKey.mockResolvedValue({
            getPublicKey: () => mockPublicKey
        });

        (jwt.decode as jest.Mock).mockReturnValue({ header: decodedHeader });
        (jwt.verify as jest.Mock).mockImplementation(() => mockPayload);

        const gatewayService = new GatewayService();
        const result = await gatewayService.auth(token);

        expect(result).toEqual(mockPayload);
        expect(mockJwksClient.getSigningKey).toHaveBeenCalledWith("test-kid");
        expect(jwt.verify).toHaveBeenCalledWith(token, mockPublicKey, { algorithms: ["RS256"] });
    });

    test("should throw TokenValidationException on invalid JWT", async () => {
        const mockPublicKey = "mock-public-key";

        mockJwksClient.getSigningKey.mockResolvedValue({
            getPublicKey: () => mockPublicKey
        });

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid JWT");
        });

        const gatewayService = new GatewayService();
        const token = "mock-jwt-token";

        await expect(gatewayService.auth(token)).rejects.toThrow(InvalidTokenException);
        expect(mockJwksClient.getSigningKey).toHaveBeenCalledWith(expect.any(String));
        expect(jwt.verify).toHaveBeenCalledWith(token, mockPublicKey, { algorithms: ["RS256"] });
    });

    test("should throw an error if JWKS_URI is not defined", () => {
        delete process.env.JWKS_URI;

        expect(() => new GatewayService()).toThrow("ENV JWKS_URI is not defined");
    });
});
