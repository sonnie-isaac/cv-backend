const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reply extends Model {
    static associate({ User, Post }) {
      // this.belongsTo(Message);
      this.belongsTo(User);
      this.belongsTo(Post);
    }
  }
  Reply.init(
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
      from: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reply",
      tableName: "replys",
    }
  );
  return Reply;
};
