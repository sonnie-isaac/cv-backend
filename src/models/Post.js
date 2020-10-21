const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate({ Reaction, Reply, User, Group, Picture, Page, Campus, Like }) {
      this.hasMany(Reaction);
      this.hasMany(Reply);
      this.hasMany(Picture);
      this.belongsTo(User);
      this.belongsTo(Group);
      this.belongsTo(Page);
      this.belongsTo(Campus);
      this.hasMany(Like);
    }
  }
  Post.init(
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
      modelName: "Post",
      tableName: "posts",
    }
  );
  return Post;
};
