import request from "supertest";
import app from "../src/app";

describe("Partner Mock routes", () => {

    test("Get Partner Mock auth should be ok", async () => {
        const res = await request(app).get("/mock/partner/auth");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            "data": {
                "token": "dalsjkdnhçalkfjaçlksfjdçalkjf",
                "uri_redirect": "http://localhost:3000/application1"
            }
        });
    });

    test("Get Application 1 should require a token", async () => {
        const res = await request(app).get("/mock/partner/application1");
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            "message": "Unauthorized"
        });
    });

    test("Get Application 1 with token should be ok", async () => {
        const res = await request(app).get("/mock/partner/application1").set("Authorization", "dalsjkdnhçalkfjaçlksfjdçalkjf");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            "message": "Welcome to Application 1"
        });
    });
});

describe("Betha Mock routes", () => {
    it("should successfully call the mock/betha/redirect-to-application1-trigger endpoint", async () => {
        const response = await request(app)
            .get("/mock/betha/redirect-to-application1-trigger")
            .set("Authorization", "Bearer test_jwt_token");

        expect(response.body).toEqual({ message: "Authorized successfully" });
        expect(response.status).toBe(200);
    });
});
