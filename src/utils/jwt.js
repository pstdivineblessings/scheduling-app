const config = require("../config/config");
const jwt = require("jsonwebtoken");

const generateTokens = (user) => {
  // create accessToken
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: user.username,
        role: user.role,
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
