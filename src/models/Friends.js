const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    static associate(models) {
      // this.belongsToMany(User, { through: 'UserFriends', as: 'users' });
    }
  }
  Friend.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Friend",
      tableName: "friends",
    }
  );

  return Friend;
};
