const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const userService = require("./userService");
const { generateTokens } = require("../utils/jwt");

/**
 * Signin user
 * @param {string} username
 * @param {string} password
 * @returns {Object}
 */
const signin = async (username, password) => {
  const foundUser = await userService.getUserByUsername(username);

  if (
    !foundUser ||
    !(await userService.isPasswordMatch(password, foundUser.password))
  ) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Incorrect username or password"
    );
  }

  // getting user roles
  let roles = await foundUser.getRoles();
  roles = roles.map((role) => role.name);

  //getting JWT Tokens
  const { accessToken, refreshToken } = generateTokens(foundUser, roles);

  // Saving refreshToken with current user
  foundUser.refreshToken = refreshToken;
  await foundUser.save();

  return { refreshToken, accessToken };
};

/**
 * Signout user
 * @param {string} refreshToken
 *
 */
const signout = async (refreshToken) => {
  const foundUser = await userService.getUserByRefreshToken(refreshToken);

  if (!foundUser) {
    return;
  }

  // Delete refreshToken in db
  foundUser.set({
    refreshToken: "",
  });
  await foundUser.save();
};

/**
 * Refresh auth token
 * @param {string} refreshToken
 * @returns {string}
 */
const refreshToken = async (refreshToken) => {
  const foundUser = await userService.getUserByRefreshToken(refreshToken);

  if (!foundUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized");
  }

  // evaluate jwt
  try {
    var decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);
    if (!decoded || foundUser.username !== decoded.username) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized");
    }
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized");
  }

  let roles = await foundUser.getRoles();
  roles = roles.map((role) => role.name);

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: decoded.username,
        roles: roles,
      },
    },
    config.jwt.accessTokenSecret,
    { expiresIn: config.jwt.accessExpiration }
  );

  //TODO add logic to regenerate new refresh token before expiration

  return accessToken;
};

module.exports = {
  signin,
  signout,
  refreshToken,
  generateTokens,
};
