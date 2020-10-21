const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate({ User, Message, Post }) {
      this.belongsTo(Message);
      this.belongsTo(User);
      this.belongsTo(Post);
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
    },
    {
      sequelize,
      modelName: "Like",
      tableName: "Likes",
    }
  );
  return Like;
};
