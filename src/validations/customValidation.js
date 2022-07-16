const moment = require("moment"); // require

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message("password must be at least 8 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "password must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

const dateFormat = (value, helpers) => {
  const mDate = moment(value, "YYYY-MM-DD", true);

  if (!mDate.isValid()) {
    return helpers.message(
      "Date must be in format YYYY-MM-DD. Example: 2000-08-20"
    );
  }

  return value;
};

module.exports = {
  password,
  dateFormat,
};
