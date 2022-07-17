const httpStatus = require("http-status");

const checkRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.role) return res.sendStatus(httpStatus.UNAUTHORIZED);

    const result = [...allowedRoles].includes(req.role);

    if (!result) return res.sendStatus(httpStatus.UNAUTHORIZED);
    next();
  };
};

module.exports = checkRoles;
