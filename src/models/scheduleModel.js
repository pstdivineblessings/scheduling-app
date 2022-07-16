const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Schedule = sequelize.define("Schedule", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    shiftLength: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },    
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  return Schedule;
};
