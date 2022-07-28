module.exports = (sequelize, DataTypes) => {
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
      role: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["staff", "admin"]
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          min: 8,
        },
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

  User.associate = function (models) {
    User.hasMany(models.Schedule, {
      foreignKey: {
        allowNull: false,
      },
    });
  };
  
  User.prototype.toJSON =  function () {
    var values = Object.assign({}, this.get());
  
    delete values.password;
    delete values.refreshToken;
    return values;
  }  

  return User;
};
