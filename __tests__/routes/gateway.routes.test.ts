import request from "supertest";

import app from "../../src/app";

describe("Gateway routes", () => {

    test("Get gateway", async () => {
        const res = await request(app).post("/partner-gateway/v1/auth");
        expect(res.text).toEqual("redirected");
        expect(res.status).toBe(200);
    });

});