const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const ROLES = require("../config/roles");
const {
  isObjectEmpty,
  getPagination,
  getPagingData,
  isUptoOneYear,
} = require("../utils/utils");
const db = require("../models");
const { User, Role } = db;
const sq = db.sequelize;
const { QueryTypes, Op } = require("sequelize");
const { generateTokens } = require("../utils/jwt");

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
 * Setting user roles
 * @param {User} user
 * @param {array<string>} roles
 */
const settingUserRoles = (user, roles) => {
  roles.forEach(async (role) => {
    const userRole = await Role.findOne({
      where: {
        name: role,
      },
    });
    if (userRole) result = await user.addRole(userRole);
  });
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
  const hashedPwd = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...userData,
    password: hashedPwd,
  });

  return newUser;
};

/**
 * Signup user
 * @param {User} userData
 * @returns {Object}
 */
const signup = async (userData) => {
  const roles = [ROLES.Staff];

  //Getting Tokens
  const { accessToken, refreshToken } = generateTokens(userData, roles);

  userData.refreshToken = refreshToken;
  const newUser = await createNew(userData);

  //Setting default roles
  settingUserRoles(newUser, roles);

  const data = newUser.toJSON();
  delete data.password;
  delete data.refreshToken;

  return { user: data, accessToken, refreshToken };
};

/**
 * Create a new user
 * @param {Object} userData
 * @returns
 */
const create = async (userData) => {
  const newUser = await createNew(userData);

  let { roles } = userData;

  if (!roles) {
    roles = [ROLES.Staff];
  }

  settingUserRoles(newUser, roles);

  const data = newUser.toJSON();
  delete data.password;

  return data;
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
    include: Role,
  });

  //if user found
  if (!userToUpdate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `No user found with this id = ${userId}`
    );
  }

  const { username, roles, password } = updateBody;

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
    const hashedPwd = await bcrypt.hash(password, 10);
    updateBody.password = hashedPwd;
  }

  if (!isObjectEmpty(updateBody)) {
    userToUpdate.set(updateBody);
    await userToUpdate.save();
  }

  if (roles) {
    // removing previous roles
    let currentRoles = await userToUpdate.getRoles();
    currentRoles.forEach(async (role) => {
      await userToUpdate.removeRole(role);
    });

    //Adding new roles
    settingUserRoles(userToUpdate, roles);
  }

  // const data = await getUserById(userId);

  const data = await User.findOne({
    where: { id: userId },
    include: Role,
  });

  // const data = userToUpdate;
  // const data = userToUpdate.toJSON();
  // delete data.password;

  return data;
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
      httpStatus.BAD_GATEWAY,
      "The maximum period of time is one year."
    );
  }

  const { limit, offset } = getPagination(page, size);

  console.log({ startDate, endDate, page, limit });

  const sqlQuery = `
      SELECT \`UserId\` as id, u.username, u.name, SUM(s.shiftLength) as workHours
      FROM \`Schedules\` s, \`Users\` u
      WHERE  u.id = s.UserId
      AND s.workDate BETWEEN :startDate AND :endDate
      GROUP BY UserId
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
  const user = await User.findOne({ where: { id }, include: Role });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No user found with id=" + id);
  }

  const data = user.toJSON();

  delete data.password;

  return data;
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
  signup,
  create,
  getUserByRefreshToken,
  getUserByUsername,
  getUserById,
  queryUsers,
  deleteUserById,
  updateUserById,
  isPasswordMatch,
};
