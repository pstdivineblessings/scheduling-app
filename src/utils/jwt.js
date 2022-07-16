const config = require("../config/config");
const jwt = require("jsonwebtoken");

const generateTokens = (user, roles) => {
  // create accessToken
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: user.username,
        roles: roles,
      },
    },
    config.jwt.accessTokenSecret,
    { expiresIn: config.jwt.accessExpiration }
  );

  //Getting resfreshToken
  const refreshToken = jwt.sign(
    { username: user.username },
    config.jwt.refreshTokenSecret,
    { expiresIn: config.jwt.refreshExpiration }
  );

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
