const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    static associate({ Message }) {
      this.belongsTo(Message, { as: 'message', foreignKey: 'messageId' });
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
      username: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Reaction",
      tableName: "reactions",
    }
  );
  return Reaction;
};
