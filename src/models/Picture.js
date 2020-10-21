const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Picture extends Model {
    static associate({ User, Group, Post, Page, Campus }) {
      this.belongsTo(User);
      this.belongsTo(Group);
      this.belongsTo(Post);
      this.belongsTo(Page);
      this.belongsTo(Campus);
    }
  }
  Picture.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: DataTypes.TEXT,
      album: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Picture",
      tableName: "pictures",
    }
  );
  return Picture;
};
