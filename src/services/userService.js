const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const {
  isObjectEmpty,
  getPagination,
  getPagingData,
  isUptoOneYear,
} = require("../utils/utils");
const db = require("../models");
const { User } = db;
const sq = db.sequelize;
const { QueryTypes, Op } = require("sequelize");

/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<User>}
 */
const getUserByUsername = async (username) => {
  return db.User.findOne({ where: { username } });
};

/**
 * Get user by refreshToken
 * @param {string} refreshToken
 * @returns {Promise<User>}
 */
const getUserByRefreshToken = async (refreshToken) => {
  return db.User.findOne({ where: { refreshToken } });
};

/**
 * Compare 2 encryted passwords
 * @param {string} password1
 * @param {string} password2
 * @returns {boolean}
 */
const isPasswordMatch = async (password1, password2) => {
  return bcrypt.compare(password1, password2);
};

/**
 * Get a new user
 * @param {Object} userData
 * @returns {User}
 */
const createNew = async (userData) => {
  let { username, password } = userData;

  // check for duplicate usernames in the db
  const duplicate = await User.findOne({
    where: {
      username,
    },
  });

  if (duplicate) {
    throw new ApiError(httpStatus.CONFLICT, "Username already taken");
  }

  //encrypt the password
  const salt = bcrypt.genSaltSync(8);
  const hashedPwd = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    ...userData,
    password: hashedPwd,
  });

  return newUser;
};

/**
 * Create a new user
 * @param {Object} userData
 * @returns
 */
const create = async (userData) => {
  const newUser = await createNew(userData);

  //Saving in the DB
  await newUser.save();

  return newUser.toJSON() ;
};

/**
 * Update user by id
 * @param {number} userId
 * @param {Object} updateBody
 * @returns {Object}
 */
const updateUserById = async (userId, updateBody) => {
  let userToUpdate = await User.findOne({
    where: { id: userId },
  });

  //if user found
  if (!userToUpdate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `No user found with this id = ${userId}`
    );
  }

  const { username, password } = updateBody;

  if (username) {
    // check for duplicate usernames in the db
    const duplicate = await User.findOne({
      where: {
        username,
        id: {
          [Op.ne]: userId,
        },
      },
    });

    if (duplicate) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This username has already been used"
      );
    }
  }

  if (password) {
    //encrypt the password
    const salt = bcrypt.genSaltSync(8);
    const hashedPwd = await bcrypt.hash(password, salt);
    updateBody.password = hashedPwd;
  }

  if (!isObjectEmpty(updateBody)) {
    userToUpdate.set(updateBody);
    await userToUpdate.save();
  }

  return userToUpdate.toJSON();
};

/**
 * Query users and list then by accumulated work hours
 * @param {Object} options
 * @returns
 */
const queryUsers = async (options) => {
  let { startDate, endDate, page, size } = options;

  if (!isUptoOneYear(startDate, endDate)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "The maximum period of time is one year."
    );
  }

  const { limit, offset } = getPagination(page, size);

  const sqlQuery = `
      SELECT 
        u.id, u.username, u.name,
        (
          SELECT IFNULL(SUM(s.shiftLength), 0) 
          FROM  \`Schedules\` s
          WHERE u.id = s.UserId
          AND s.workDate BETWEEN :startDate AND :endDate
        ) as workHours
      FROM  \`Users\` u
      ORDER BY workHours DESC
    `;

  const data = await sq.query(`${sqlQuery} LIMIT :limit OFFSET :offset`, {
    replacements: {
      limit,
      offset,
      startDate,
      endDate,
    },
    type: QueryTypes.SELECT,
  });

  const totalData = await sq.query(
    `SELECT COUNT(*) as total FROM  ( ${sqlQuery} ) as totals`,
    {
      replacements: {
        startDate,
        endDate,
      },
      plain: true,
      type: QueryTypes.SELECT,
    }
  );

  const totalItems = totalData?.total;

  return getPagingData(data, totalItems, page, limit);
};

/**
 * Get user by id
 * @param {number} id
 * @returns
 */
const getUserById = async (id) => {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No user found with id=" + id);
  }

  return  user.toJSON();
};

/**
 * Delete user by id
 * @param {number} id
 */
const deleteUserById = async (id) => {
  const result = await User.destroy({
    where: { id: id },
  });

  if (result === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot delete User with id=${id}. Maybe User was not found!`
    );
  }
};

module.exports = {
  create,
  createNew,
  getUserByRefreshToken,
  getUserByUsername,
  getUserById,
  queryUsers,
  deleteUserById,
  updateUserById,
  isPasswordMatch,
};
