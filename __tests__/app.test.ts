import request from "supertest";
import app from "../src/app";

describe("Test app.ts", () => {

    test("Alive route", async () => {
        const res = await request(app).get("/alive");
        expect(res.text).toEqual("yes");
    });
});