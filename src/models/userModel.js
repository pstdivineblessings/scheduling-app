const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
          min: 8
        }
      },
      refreshToken: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      validate: {
        passwordInCorrect() {
          if (!this.password.match(/\d/) || !this.password.match(/[a-zA-Z]/)) {
            throw new Error(
              "Password must contain at least one letter and one number"
            );
          }
        },
      },
    }
  );

  return User;
};
