import request from "supertest";
import app from "../../src/app";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Betha Mock routes", () => {
    it("should successfully call the /betha/redirect-to-application1-trigger endpoint", async () => {
        // Mock the Axios response
        mockedAxios.post.mockResolvedValueOnce({
            data: { message: "Authorized successfully" },
            status: 200,
        });

        const response = await request(app)
            .get("/betha/redirect-to-application1-trigger") // Call the endpoint
            .set("Authorization", "Bearer test_jwt_token"); // Set headers if necessary

        // Assertions
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Authorized successfully" });

        // Verify Axios was called correctly
        expect(mockedAxios.post).toHaveBeenCalledWith(
            "http://localhost:3000/partner-gateway/v1/auth",
            {},
            {
                headers: {
                    Accept: "application/json",
                    Authorization: "Bearer test_jwt_token",
                },
                timeout: 5000
            }
        );
    });
});
