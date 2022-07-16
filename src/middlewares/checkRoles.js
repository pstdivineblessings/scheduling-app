const httpStatus = require("http-status");

const checkRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.sendStatus(httpStatus.UNAUTHORIZED);

    const rolesArray = [...allowedRoles];

    const result = req.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true);
    if (!result) return res.sendStatus(httpStatus.UNAUTHORIZED);
    next();
  };
};

module.exports = checkRoles;
