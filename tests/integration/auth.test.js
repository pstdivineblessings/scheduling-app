const request = require("supertest");
const faker = require("faker");
const httpStatus = require("http-status");
const app = require("../../src/app");
const { authService } = require("../../src/services");
const setupTestDB = require("../utils/setupTestDB");
const { User } = require("../../src/models");
const { staff1, insertUsers } = require("../fixtures/user.fixture");
const { generateTokens } = require("../../src/utils/jwt");

setupTestDB();

describe("Auth routes", () => {
  describe("POST /v1/auth/signup", () => {
    let newUser;
    const apiRoute = "/v1/auth/signup";
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        username: faker.internet.userName(),
        password: "Password@22",
      };
    });

    test("should return 201 and successfully signup user if request data is ok", async () => {
      const res = await request(app)
        .post(apiRoute)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.user).not.toHaveProperty("password");
      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: newUser.name,
        username: newUser.username,
        role: "staff",
        updatedAt: expect.anything(),
        createdAt: expect.anything(),
      });

      const dbUser = await User.findByPk(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        name: newUser.name,
        username: newUser.username,
        role: "staff",
        updatedAt: expect.anything(),
        createdAt: expect.anything(),
      });

      expect(res.body.accessToken).toBeDefined;
      expect(res.body.refreshToken).toBeDefined;
    });

    test("should return 400 error if username is already used", async () => {
      await insertUsers([staff1]);
      newUser.username = staff1.userName;

      await request(app)
        .post(apiRoute)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if password length is less than 8 characters", async () => {
      newUser.password = "passwo1";

      await request(app)
        .post(apiRoute)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if password does not contain both letters and numbers", async () => {
      newUser.password = "password";

      await request(app)
        .post(apiRoute)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      newUser.password = "11111111";

      await request(app)
        .post(apiRoute)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("POST /v1/auth/signin", () => {
    const apiRoute = "/v1/auth/signin";
    test("should return 200 and login user if username and password match", async () => {
      await insertUsers([staff1]);

      const loginCredentials = {
        username: staff1.username,
        password: staff1.password,
      };

      const res = await request(app)
        .post(apiRoute)
        .send(loginCredentials)
        .expect(httpStatus.OK);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: staff1.name,
        username: staff1.username,
        role: "staff",
        updatedAt: expect.anything(),
        createdAt: expect.anything(),
      });

      expect(res.body.accessToken).toBeDefined;
      expect(res.body.refreshToken).toBeDefined;
    });

    test("shoud return 401 error if there are no users with that username", async () => {
      const loginCredentials = {
        username: staff1.username,
        password: staff1.password,
      };

      const res = await request(app)
        .post(apiRoute)
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: "Incorrect username or password",
      });

      // console.log(
      //   "shoud return 401 error if there are no users with that lusername",
      //   res.body
      // );
    });

    test("should return 401 error if password is wrong", async () => {
      await insertUsers([staff1]);

      const loginCredentials = {
        username: staff1.username,
        password: "wrongPassword1",
      };

      const res = await request(app)
        .post(apiRoute)
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      // console.log("should return 401 error if password is wrong", res.body);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: "Incorrect username or password",
      });
    });
  });

  describe("POST /v1/auth/signout", () => {
    const apiRoute = "/v1/auth/signout";

    test("should return 204 if refresh token is valid", async () => {
      await insertUsers([staff1]);

      const { refreshToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .post(apiRoute)
        .send({ refreshToken })
        .expect(httpStatus.NO_CONTENT);

      const dbStaff1 = await User.findOne({ token: refreshToken });
      expect(dbStaff1.refreshToken).toBe("");
    });

    test("should return 400 error if refresh token is missing from request body", async () => {
      await request(app)
        .post(apiRoute)
        .send({ refreshToken: "" })
        .expect(httpStatus.BAD_REQUEST);
    });

    // test("should return 404 error if refresh token is not found in the database", async () => {
    //   await request(app)
    //     .post(apiRoute)
    //     .send({ refreshToken: "asfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdffasdfasfd" })
    //     .expect(httpStatus.NOT_FOUND);
    // });
  });

  // describe("POST /v1/auth/refresh-token", () => {
  //   const apiRoute = "/v1/auth/refresh-token";

  //   // test("should return 200 and new auth tokens if refresh token is valid", async () => {
  //   //   await insertUsers([staff1]);

  //   //   const { refreshToken, accessToken } = await authService.signin(
  //   //     staff1.username,
  //   //     staff1.password
  //   //   );

  //   //   const res = await request(app)
  //   //     .post("apiRoute")
  //   //     .send({ refreshToken })
  //   //     .expect(httpStatus.OK);

  //   //   expect(res.body).toEqual({
  //   //     accessToken: expect.anything(),
  //   //     refreshToken: expect.anything(),
  //   //   });

  //   //   expect(res.body).toEqual({
  //   //     accessToken: expect.not(accessToken),
  //   //     refreshToken: expect.toEqual(refreshToken),
  //   //   });
  //   // });

  //   // test("should return 400 error if refresh token is missing from request body", async () => {
  //   //   await request(app).post(apiRoute).send({}).expect(httpStatus.BAD_REQUEST);
  //   // });
  // });
});
