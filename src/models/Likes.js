const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
    }
  }
  Like.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userAvatar: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Like",
      tableName: "Likes",
    }
  );
  return Like;
};
