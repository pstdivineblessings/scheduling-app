const jwt = require("jsonwebtoken");
const config = require("../config/config");
const httpStatus = require("http-status");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, config.jwt.accessTokenSecret, (err, decoded) => {
    if (err) {
      return res.sendStatus(httpStatus.FORBIDDEN); //invalid token
    }

    req.user = decoded.UserInfo.username;
    req.role = decoded.UserInfo.role;
    next();
  });
};

module.exports = verifyJWT;
