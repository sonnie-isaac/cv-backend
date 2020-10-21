const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    static associate({ User, Message, Post }) {
      this.belongsTo(Message);
      this.belongsTo(User);
      this.belongsTo(Post);
    }
  }
  Reaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reaction",
      tableName: "reactions",
    }
  );
  return Reaction;
};
