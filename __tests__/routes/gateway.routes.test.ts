import request from "supertest";

import app from "../../src/app";

describe("Gateway routes", () => {

    test("Get gateway", async () => {
        const res = await request(app).get("/");
        expect(res.text).toEqual("redirected");
        expect(res.status).toBe(301);
    });

});