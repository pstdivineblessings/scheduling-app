const moment = require("moment");

const isObjectEmpty = (obj) => {
  for (var x in obj) {
    return false;
  }
  return true;
};

const getPagination = (page, size) => {
  if (!page || page <= 0) {
    page = 1;
  }

  if (!size) {
    size = 1;
  }

  const limit = parseInt(size);
  const offset = (page - 1) * limit;
  return { limit, offset, page, size };
};

const getPagingData = (data, totalItems, page, limit) => {
  // console.log({ totalData, data });
  let  results = [],
    currentPage = page,
    totalPages = 0;

  if (data.length !== 0) {
    results = data;
    currentPage = page;
    totalPages = Math.ceil(totalItems / limit);
  }

  return { totalItems, results, totalPages, currentPage };
};

const isUptoOneYear = (starDate, endDate) => {
  const dateFormat = "YYYY-MM-DD";
  const mDate1 = moment(starDate, dateFormat);
  const mDate2 = moment(endDate, dateFormat);

  if (mDate2.diff(mDate1, "month") > 12) {
    return false;
  }

  return true;
};

module.exports = { isObjectEmpty, getPagination, getPagingData, isUptoOneYear };
