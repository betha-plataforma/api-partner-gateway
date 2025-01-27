import request from "supertest";
import app from "../app";

describe("Partner Mock routes", () => {

    test("Get Partner Mock auth should be ok", async () => {
        const res = await request(app).post("/mock/partner/auth?database=testDB&entity=user&system=auth");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            "uriRedirect": "http://localhost:3000/mock/partner/application1",
            "method": "GET",
            "headers": {
                "Authorization": "Bearer access-token-to-application1",
                "Accept": "application/json"
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
        const res = await request(app).get("/mock/partner/application1")
            .set("Authorization", "Bearer access-token-to-application1");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            "message": "Welcome to Application 1"
        });
    });
});
