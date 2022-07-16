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
    req.roles = decoded.UserInfo.roles;
    next();
  });
};

module.exports = verifyJWT;
