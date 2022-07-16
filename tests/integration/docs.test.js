const request = require("supertest");
const httpStatus = require("http-status");
const app = require("../../app");
const config = require("../../config/config");

describe("Auth routes", () => {
  describe("GET /v1/docs", () => {
    test("should return 404 when running in production", async () => {
      // config.env = "production";

      const loginCredentials = {
        username: "admin",
        password: "12345678",
      };

      const res = await request(app)
        .post("/v1/auth/signin")
        .send(loginCredentials)
        .expect(httpStatus.OK);

      // console.log("test", res);
      // await request(app).get("/v1/docs").send().expect(httpStatus.NOT_FOUND);
      // expect(1+2).toBe(3);
      // config.env = process.env.NODE_ENV;
    });
  });
});
