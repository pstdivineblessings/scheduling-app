module.exports = (sequelize, DataTypes) => {
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

  Schedule.associate = function (models) {
    Schedule.belongsTo(models.User);
  };

  return Schedule;
};
