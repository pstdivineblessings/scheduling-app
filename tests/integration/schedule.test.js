const request = require("supertest");
const httpStatus = require("http-status");
const app = require("../../src/app");
const { authService } = require("../../src/services");
const setupTestDB = require("../utils/setupTestDB");
const { Schedule } = require("../../src/models");
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

describe("Schedules routes", () => {
  let adminAccessToken;
  let newSchedule;
  const apiRoute = "/v1/schedules";

  beforeEach(async () => {
    await insertUsers([admin, staff1]);

    const { accessToken } = await authService.signin(
      admin.username,
      admin.password
    );
    adminAccessToken = accessToken;
  });

  describe("POST /v1/schedules", () => {
    beforeEach(async () => {
      newSchedule = {
        workDate: "2022-01-01",
        shiftLength: 8,
        username: staff1.username,
      };
    });

    test("should return 201 and successfully create new schedule if data is ok", async () => {
      const res = await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(newSchedule)
        .expect(httpStatus.CREATED);

      expect(res.body.schedule).toEqual({
        id: expect.anything(),
        shiftLength: newSchedule.shiftLength,
        workDate: newSchedule.workDate,
        UserId: staff1.id,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        completed: expect.anything(),
      });

      const dbSchedule = await Schedule.findByPk(res.body.schedule.id);
      expect(dbSchedule).toBeDefined();
      expect(dbSchedule).toMatchObject({
        shiftLength: newSchedule.shiftLength,
        workDate: newSchedule.workDate,
        UserId: staff1.id,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        completed: expect.anything(),
      });
    });

    test("should return 403 error if access token is missing", async () => {
      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer 12345678`)
        .send(newSchedule)
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newSchedule)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 409 error if existing schedule already planned on a specific date", async () => {
      await insertSchedules([staff1Schedule2]);

      newSchedule.workDate = staff1Schedule2.workDate;
      newSchedule.username = staff1.username;

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(newSchedule)
        .expect(httpStatus.CONFLICT);
    });

    test("should return 400 error if work date invalid", async () => {
      newSchedule.workDate = "invalid";

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(newSchedule)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if shift length invalid", async () => {
      newSchedule.shiftLength = "invalid";

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(newSchedule)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if user not found in DB", async () => {
      newSchedule.username = staff2.username;

      await request(app)
        .post(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(newSchedule)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("GET /v1/schedules", () => {
    let options = {
      userId: staff1.id,
      startDate: "2022-01-01",
      endDate: "2022-03-01",
      page: 1,
      size: 1,
    };

    beforeEach(async () => {
      await insertUsers([staff2, staff3]);

      await insertSchedules([
        staff1Schedule1,
        staff1Schedule2,
        staff2Schedule2,
        staff3Schedule3,
      ]);
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
        totalItems: 2,
      });

      expect(res.body.results).toHaveLength(1);

      expect(res.body.results[0]).toEqual({
        id: expect.anything(),
        UserId: staff1.id,
        workDate: staff1Schedule1.workDate,
        shiftLength: staff1Schedule1.shiftLength,
        completed: staff1Schedule1.completed,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
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
        totalItems: 2,
      });

      expect(res.body.results).toHaveLength(1);

      expect(res.body.results[0]).toEqual({
        id: expect.anything(),
        UserId: staff1.id,
        workDate: staff1Schedule2.workDate,
        shiftLength: staff1Schedule2.shiftLength,
        completed: staff1Schedule2.completed,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test("should return 200 and correct data if staff user want to see his schedules", async () => {
      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      const res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .query({ ...options })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        currentPage: 1,
        totalPages: 2,
        totalItems: 2,
      });

      expect(res.body.results).toHaveLength(1);

      expect(res.body.results[0]).toEqual({
        id: expect.anything(),
        UserId: staff1.id,
        workDate: staff1Schedule1.workDate,
        shiftLength: staff1Schedule1.shiftLength,
        completed: staff1Schedule1.completed,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test("should return 200 and correct data if staff user want to see other user's schedules", async () => {
      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      const res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${accessToken}`)
        .query({ ...options, userId: staff2.id })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
      });

      expect(res.body.results).toHaveLength(1);

      expect(res.body.results[0]).toEqual({
        id: expect.anything(),
        UserId: staff2.id,
        workDate: staff2Schedule2.workDate,
        shiftLength: staff2Schedule2.shiftLength,
        completed: staff2Schedule2.completed,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test("should return 403 error if access token is missing", async () => {
      await request(app)
        .get(apiRoute)
        .query({ ...options })
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 400 error if the userId is not provided", async () => {
      const res = await request(app)
        .get(apiRoute)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({
          ...options,
          page: 1,
          userId: null,
        })
        .send()
        .expect(httpStatus.BAD_REQUEST);
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

  describe("GET /v1/schedules/:scheduleId", () => {
    test("should return 200 and the schedule object if data is ok", async () => {
      await insertSchedules([staff1Schedule1]);

      const res = await request(app)
        .get(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: staff1Schedule1.id,
        shiftLength: staff1Schedule1.shiftLength,
        workDate: staff1Schedule1.workDate,
        UserId: staff1.id,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        completed: expect.anything(),
      });
    });

    test("should return 403 error if access token is missing", async () => {
      await insertSchedules([staff1Schedule1]);

      await request(app)
        .get(`${apiRoute}/${staff1Schedule1.id}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      await insertSchedules([staff1Schedule1]);

      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .get(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 400 error if scheduleId is not a valid id", async () => {
      await request(app)
        .get(`${apiRoute}/invalidId`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    // test("should return 400 error if schedule is not found", async () => {
    //   await request(app)
    //     .get(`${apiRoute}/${staff1Schedule2.id}`)
    //     .set("Authorization", `Bearer ${adminAccessToken}`)
    //     .send()
    //     .expect(httpStatus.BAD_REQUEST);
    // });
  });

  describe("DELETE /v1/schedules/:scheduleId", () => {
    test("should return 204 if data is ok", async () => {
      await insertSchedules([staff1Schedule1]);

      await request(app)
        .delete(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSchedule = await Schedule.findByPk(staff1Schedule1.id);
      expect(dbSchedule).toBeNull();
    });

    test("should return 403 error if access token is missing", async () => {
      await insertSchedules([staff1Schedule1]);

      await request(app)
        .delete(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer 12345678`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      await insertSchedules([staff1Schedule1]);

      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      await request(app)
        .delete(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 400 error if scheduleId is not a valid id", async () => {
      await request(app)
        .delete(`${apiRoute}/invalidId`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if schedule is not found", async () => {
      await request(app)
        .delete(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("PATCH /v1/schedules/:scheduleId", () => {
    test("should return 200 and successfully update user if data is ok", async () => {
      await insertSchedules([staff1Schedule1]);

      const updateBody = {
        workDate: staff1Schedule1.workDate,
        shiftLength: 16,
      };

      const res = await request(app)
        .patch(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.schedule).toEqual({
        id: staff1Schedule1.id,
        workDate: updateBody.workDate,
        shiftLength: updateBody.shiftLength,
        UserId: staff1.id,
        completed: expect.anything(),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test("should return 403 error if access token is missing", async () => {
      const updateBody = {
        shiftLength: 16,
      };

      await insertSchedules([staff1Schedule1]);

      await request(app)
        .patch(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer 12345678`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 401 error if logged in user is not admin", async () => {
      const { accessToken } = await authService.signin(
        staff1.username,
        staff1.password
      );

      const updateBody = {
        shiftLength: 16,
      };

      await insertSchedules([staff1Schedule1]);

      await request(app)
        .patch(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 400 error if scheduleId is not a valid id", async () => {
      await insertSchedules([staff1Schedule1]);
      const updateBody = { shiftLength: 16 };

      await request(app)
        .patch(`${apiRoute}/invalidId`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if schedule is not found", async () => {
      const updateBody = { shiftLength: 16 };

      await request(app)
        .patch(`${apiRoute}/${staff1Schedule1.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
