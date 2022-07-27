const request = require("supertest");
const faker = require("faker");
const httpStatus = require("http-status");
const app = require("../../src/app");
const { authService } = require("../../src/services");
const setupTestDB = require("../utils/setupTestDB");
const { User } = require("../../src/models");
const {
  admin,
  staff1,
  staff2,
  staff3,
  insertUsers,
} = require("../fixtures/user.fixture");
const {
  staff1Schedule1,
  staff1Schedule2,
  staff2Schedule2,
  staff3Schedule3,
  insertSchedules,
} = require("../fixtures/schedule.fixture");

setupTestDB();

describe("User routes", () => {
  const apiRoute = "/v1/users";

  describe("POST /v1/users", () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        username: faker.internet.userName().toLowerCase(),
        password: "Password@22",
        role: "staff",
      };
    });

    test("should return 201 and successfully create new user if data is ok", async () => {
      await insertUsers([admin]);

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      const res = await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.user).not.toHaveProperty("password");
      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbUser = await User.findByPk(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test("should be able to create an admin as well", async () => {
      await insertUsers([admin]);
      newUser.role = "admin";

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      const res = await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.user.role).toBe("admin");

      const dbUser = await User.findByPk(res.body.user.id);
      expect(dbUser.role).toBe("admin");
    });

    test("should return 403 error if access token is missing", async () => {
      await request(app)
        .post(apiRoute)
        .send(newUser)
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      await insertUsers([staff1]);

      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newUser)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 409 error if username is already used", async () => {
      await insertUsers([admin, staff1]);
      newUser.username = staff1.username;

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newUser)
        .expect(httpStatus.CONFLICT);
    });

    test("should return 400 error if password length is less than 8 characters", async () => {
      await insertUsers([admin]);
      newUser.password = "passwo1";

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if password does not contain both letters and numbers", async () => {
      await insertUsers([admin]);
      newUser.password = "password";

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      newUser.password = "1111111";

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if role is neither staff nor admin", async () => {
      await insertUsers([admin]);
      newUser.role = "invalid";

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("GET /v1/users", () => {
    let options = {
        startDate: "2022-01-01",
        endDate: "2022-03-01",
        page: 1,
        size: 2,
      },
      adminAccessToken;

    beforeEach(async () => {
      await insertUsers([admin, staff1, staff2, staff3]);

      await insertSchedules([
        staff1Schedule1,
        staff1Schedule2,
        staff2Schedule2,
        staff3Schedule3,
      ]);

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );
      adminAccessToken = accessToken;
    });

    test("should return 200 and apply the default query options", async () => {
      const res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({ ...options })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        currentPage: 1,
        totalPages: 2,
        totalItems: 3,
      });

      expect(res.body.results).toHaveLength(2);

      expect(res.body.results[0]).toEqual({
        id: expect.anything(),
        username: staff1.username,
        name: staff1.name,
        workHours: "16",
      });

      // expect(res.body.results[1]).toEqual({
      //   id: expect.anything(),
      //   username: staff2.username,
      //   name: staff2.name,
      //   workHours: "8",
      // });
    });

    test("should return 403 error if access token is missing", async () => {
      await request(app)
        .get(apiRoute)
        .query({ ...options })
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .query({ ...options })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return the correct page specified", async () => {
      const res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({ ...options, page: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        currentPage: 2,
        totalPages: 2,
        totalItems: 3,
      });

      expect(res.body.results).toHaveLength(1);
      // console.log(res.body);

      expect(res.body.results[0]).toEqual({
        id: expect.anything(),
        username: staff3.username,
        name: staff3.name,
        workHours: "8",
      });
    });

    test("should return 400 error if the period of time is not provided or is incorrect", async () => {
      //Testing empty startDate and endDate
      let res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({ ...options, page: 1, startDate: "", endDate: "" })
        .send()
        .expect(httpStatus.BAD_REQUEST);

      //Testing empty endDate
      res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({ ...options, page: 1, endDate: "" })
        .send()
        .expect(httpStatus.BAD_REQUEST);

      //Testing empty startDate
      res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({ ...options, page: 1, startDate: "" })
        .send()
        .expect(httpStatus.BAD_REQUEST);

      //Testing wrong date format
      res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({ ...options, page: 1, startDate: "01-01-2022" })
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if the period of time is more than one year", async () => {
      const res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({
          ...options,
          page: 1,
          startDate: "2021-01-01",
          endDate: "2022-03-01",
        })
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("GET /v1/users/:userId", () => {
    test("should return 200 and the user object if data is ok", async () => {
      await insertUsers([staff1, admin]);

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      const res = await request(app)
        .get(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty("password");
      expect(res.body).toEqual({
        id: staff1.id,
        username: staff1.username,
        name: staff1.name,
        role: staff1.role,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test("should return 403 error if access token is missing", async () => {
      await insertUsers([staff1]);

      await request(app)
        .get(`/v1/users/${staff1.id}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      await insertUsers([staff1]);

      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .get(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 400 error if userId is not a valid id", async () => {
      await insertUsers([admin]);

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .get("/v1/users/invalidId")
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if user is not found", async () => {
      await insertUsers([admin]);

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .get(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("DELETE /v1/users/:userId", () => {
    test("should return 204 if data is ok", async () => {
      await insertUsers([staff1, admin]);

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .delete(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findByPk(staff1.id);
      expect(dbUser).toBeNull();
    });

    test("should return 403 error if access token is missing", async () => {
      await insertUsers([staff1]);

      await request(app)
        .delete(`/v1/users/${staff1.id}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      await insertUsers([staff1]);

      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .delete(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 400 error if userId is not a valid id", async () => {
      await insertUsers([admin]);

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .delete("/v1/users/invalidId")
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if user is not found", async () => {
      await insertUsers([admin]);

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .delete(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("PATCH /v1/users/:userId", () => {
    test("should return 200 and successfully update user if data is ok", async () => {
      await insertUsers([staff1, admin]);

      const updateBody = {
        name: faker.name.findName(),
        username: faker.internet.userName().toLowerCase(),
        password: "newPassword1",
      };

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      const res = await request(app)
        .patch(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.user).not.toHaveProperty("password");
      expect(res.body.user).toEqual({
        id: staff1.id,
        name: updateBody.name,
        username: updateBody.username,
        role: "staff",
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbUser = await User.findByPk(staff1.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({
        name: updateBody.name,
        username: updateBody.username,
        role: "staff",
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test("should return 403 error if access token is missing", async () => {
      await insertUsers([staff1]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${staff1.id}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      await insertUsers([staff1]);
      const updateBody = { name: faker.name.findName() };

      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .patch(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 400 error if userId is not a valid id", async () => {
      await insertUsers([admin]);
      const updateBody = { name: faker.name.findName() };

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .patch("/v1/users/invalidId")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if user is not found", async () => {
      await insertUsers([admin]);
      const updateBody = { name: faker.name.findName() };

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .patch(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 409 if username is already taken", async () => {
      await insertUsers([staff1, staff2, admin]);
      const updateBody = { username: staff2.username };

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .patch(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.CONFLICT);
    });

    test("should return 400 if password length is less than 8 characters", async () => {
      await insertUsers([staff1, admin]);
      const updateBody = { password: "passwo1" };

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .patch(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 if password does not contain both letters and numbers", async () => {
      await insertUsers([staff1, admin]);
      const updateBody = { password: "password" };

      const { accessToken } = await authService.signin(
        admin.username,
        admin.password
      );

      await request(app)
        .patch(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.password = "11111111";

      await request(app)
        .patch(`/v1/users/${staff1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
