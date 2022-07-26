const request = require("supertest");
const faker = require("faker");
const httpStatus = require("http-status");
const app = require("../../src/app");
const { authService } = require("../../src/services");
const setupTestDB = require("../utils/setupTestDB");
const { User } = require("../../src/models");
const { staff1, insertUsers } = require("../fixtures/user.fixture");

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
      await request(app).post(apiRoute).send().expect(httpStatus.BAD_REQUEST);
    });

    // test("should return 404 error if refresh token is not found in the database", async () => {
    //   await insertUsers([staff1]);

    //   const { refreshToken } = generateToken(staff1);

    //   await request(app)
    //     .post(apiRoute)
    //     .send({ refreshToken })
    //     .expect(httpStatus.NOT_FOUND);
    // });
  });

  // describe("POST /v1/auth/refresh-token", () => {
  //   const apiRoute = "/v1/auth/refresh-token";

  //   test("should return 200 and new auth tokens if refresh token is valid", async () => {
  //     await insertUsers([staff1]);

  //     const { refreshToken, accessToken } = await authService.signin(
  //       staff1.username,
  //       staff1.password
  //     );

  //     const res = await request(app)
  //       .post("apiRoute")
  //       .send({ refreshToken })
  //       .expect(httpStatus.OK);

  //     expect(res.body).toEqual({
  //       accessToken: expect.anything(),
  //       refreshToken: expect.anything()
  //     });

  //     expect(res.body).toEqual({
  //       accessToken: expect.not(accessToken),
  //       refreshToken: expect.toEqual(refreshToken)
  //     });
  //   });

  //   test("should return 400 error if refresh token is missing from request body", async () => {
  //     await request(app)
  //       .post(apiRoute)
  //       .send()
  //       .expect(httpStatus.BAD_REQUEST);
  //   });

  //   // test("should return 401 error if refresh token is signed using an invalid secret", async () => {
  //   //   await insertUsers([userOne]);
  //   //   const expires = moment().add(config.jwt.refreshExpirationDays, "days");
  //   //   const refreshToken = tokenService.generateToken(
  //   //     userOne._id,
  //   //     expires,
  //   //     tokenTypes.REFRESH,
  //   //     "invalidSecret"
  //   //   );
  //   //   await tokenService.saveToken(
  //   //     refreshToken,
  //   //     userOne._id,
  //   //     expires,
  //   //     tokenTypes.REFRESH
  //   //   );

  //   //   await request(app)
  //   //     .post("/v1/auth/refresh-tokens")
  //   //     .send({ refreshToken })
  //   //     .expect(httpStatus.UNAUTHORIZED);
  //   // });

  //   // test("should return 401 error if refresh token is not found in the database", async () => {
  //   //   await insertUsers([userOne]);
  //   //   const expires = moment().add(config.jwt.refreshExpirationDays, "days");
  //   //   const refreshToken = tokenService.generateToken(
  //   //     userOne._id,
  //   //     expires,
  //   //     tokenTypes.REFRESH
  //   //   );

  //   //   await request(app)
  //   //     .post("/v1/auth/refresh-tokens")
  //   //     .send({ refreshToken })
  //   //     .expect(httpStatus.UNAUTHORIZED);
  //   // });

  //   // test("should return 401 error if refresh token is blacklisted", async () => {
  //   //   await insertUsers([userOne]);
  //   //   const expires = moment().add(config.jwt.refreshExpirationDays, "days");
  //   //   const refreshToken = tokenService.generateToken(
  //   //     userOne._id,
  //   //     expires,
  //   //     tokenTypes.REFRESH
  //   //   );
  //   //   await tokenService.saveToken(
  //   //     refreshToken,
  //   //     userOne._id,
  //   //     expires,
  //   //     tokenTypes.REFRESH,
  //   //     true
  //   //   );

  //   //   await request(app)
  //   //     .post("/v1/auth/refresh-tokens")
  //   //     .send({ refreshToken })
  //   //     .expect(httpStatus.UNAUTHORIZED);
  //   // });

  //   // test("should return 401 error if refresh token is expired", async () => {
  //   //   await insertUsers([userOne]);
  //   //   const expires = moment().subtract(1, "minutes");
  //   //   const refreshToken = tokenService.generateToken(userOne._id, expires);
  //   //   await tokenService.saveToken(
  //   //     refreshToken,
  //   //     userOne._id,
  //   //     expires,
  //   //     tokenTypes.REFRESH
  //   //   );

  //   //   await request(app)
  //   //     .post("/v1/auth/refresh-tokens")
  //   //     .send({ refreshToken })
  //   //     .expect(httpStatus.UNAUTHORIZED);
  //   // });

  //   // test("should return 401 error if user is not found", async () => {
  //   //   const expires = moment().add(config.jwt.refreshExpirationDays, "days");
  //   //   const refreshToken = tokenService.generateToken(
  //   //     userOne._id,
  //   //     expires,
  //   //     tokenTypes.REFRESH
  //   //   );
  //   //   await tokenService.saveToken(
  //   //     refreshToken,
  //   //     userOne._id,
  //   //     expires,
  //   //     tokenTypes.REFRESH
  //   //   );

  //   //   await request(app)
  //   //     .post("/v1/auth/refresh-tokens")
  //   //     .send({ refreshToken })
  //   //     .expect(httpStatus.UNAUTHORIZED);
  //   // });

  // });
});

// describe("Auth middleware", () => {
//   test("should call next with no errors if access token is valid", async () => {
//     await insertUsers([userOne]);
//     const req = httpMocks.createRequest({
//       headers: { Authorization: `Bearer ${userOneAccessToken}` },
//     });
//     const next = jest.fn();

//     await auth()(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith();
//     expect(req.user._id).toEqual(userOne._id);
//   });

//   test("should call next with unauthorized error if access token is not found in header", async () => {
//     await insertUsers([userOne]);
//     const req = httpMocks.createRequest();
//     const next = jest.fn();

//     await auth()(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
//     expect(next).toHaveBeenCalledWith(
//       expect.objectContaining({
//         statusCode: httpStatus.UNAUTHORIZED,
//         message: "Please authenticate",
//       })
//     );
//   });

//   test("should call next with unauthorized error if access token is not a valid jwt token", async () => {
//     await insertUsers([userOne]);
//     const req = httpMocks.createRequest({
//       headers: { Authorization: "Bearer randomToken" },
//     });
//     const next = jest.fn();

//     await auth()(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
//     expect(next).toHaveBeenCalledWith(
//       expect.objectContaining({
//         statusCode: httpStatus.UNAUTHORIZED,
//         message: "Please authenticate",
//       })
//     );
//   });

//   test("should call next with unauthorized error if the token is not an access token", async () => {
//     await insertUsers([userOne]);
//     const expires = moment().add(config.jwt.accessExpirationMinutes, "minutes");
//     const refreshToken = tokenService.generateToken(
//       userOne._id,
//       expires,
//       tokenTypes.REFRESH
//     );
//     const req = httpMocks.createRequest({
//       headers: { Authorization: `Bearer ${refreshToken}` },
//     });
//     const next = jest.fn();

//     await auth()(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
//     expect(next).toHaveBeenCalledWith(
//       expect.objectContaining({
//         statusCode: httpStatus.UNAUTHORIZED,
//         message: "Please authenticate",
//       })
//     );
//   });

//   test("should call next with unauthorized error if access token is generated with an invalid secret", async () => {
//     await insertUsers([userOne]);
//     const expires = moment().add(config.jwt.accessExpirationMinutes, "minutes");
//     const accessToken = tokenService.generateToken(
//       userOne._id,
//       expires,
//       tokenTypes.ACCESS,
//       "invalidSecret"
//     );
//     const req = httpMocks.createRequest({
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });
//     const next = jest.fn();

//     await auth()(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
//     expect(next).toHaveBeenCalledWith(
//       expect.objectContaining({
//         statusCode: httpStatus.UNAUTHORIZED,
//         message: "Please authenticate",
//       })
//     );
//   });

//   test("should call next with unauthorized error if access token is expired", async () => {
//     await insertUsers([userOne]);
//     const expires = moment().subtract(1, "minutes");
//     const accessToken = tokenService.generateToken(
//       userOne._id,
//       expires,
//       tokenTypes.ACCESS
//     );
//     const req = httpMocks.createRequest({
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });
//     const next = jest.fn();

//     await auth()(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
//     expect(next).toHaveBeenCalledWith(
//       expect.objectContaining({
//         statusCode: httpStatus.UNAUTHORIZED,
//         message: "Please authenticate",
//       })
//     );
//   });

//   test("should call next with unauthorized error if user is not found", async () => {
//     const req = httpMocks.createRequest({
//       headers: { Authorization: `Bearer ${userOneAccessToken}` },
//     });
//     const next = jest.fn();

//     await auth()(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
//     expect(next).toHaveBeenCalledWith(
//       expect.objectContaining({
//         statusCode: httpStatus.UNAUTHORIZED,
//         message: "Please authenticate",
//       })
//     );
//   });

//   test("should call next with forbidden error if user does not have required rights and userId is not in params", async () => {
//     await insertUsers([userOne]);
//     const req = httpMocks.createRequest({
//       headers: { Authorization: `Bearer ${userOneAccessToken}` },
//     });
//     const next = jest.fn();

//     await auth("anyRight")(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
//     expect(next).toHaveBeenCalledWith(
//       expect.objectContaining({
//         statusCode: httpStatus.FORBIDDEN,
//         message: "Forbidden",
//       })
//     );
//   });

//   test("should call next with no errors if user does not have required rights but userId is in params", async () => {
//     await insertUsers([userOne]);
//     const req = httpMocks.createRequest({
//       headers: { Authorization: `Bearer ${userOneAccessToken}` },
//       params: { userId: userOne._id.toHexString() },
//     });
//     const next = jest.fn();

//     await auth("anyRight")(req, httpMocks.createResponse(), next);

//     expect(next).toHaveBeenCalledWith();
//   });

//   test("should call next with no errors if user has required rights", async () => {
//     await insertUsers([admin]);
//     const req = httpMocks.createRequest({
//       headers: { Authorization: `Bearer ${adminAccessToken}` },
//       params: { userId: userOne._id.toHexString() },
//     });
//     const next = jest.fn();

//     await auth(...roleRights.get("admin"))(
//       req,
//       httpMocks.createResponse(),
//       next
//     );

//     expect(next).toHaveBeenCalledWith();
//   });
// });
