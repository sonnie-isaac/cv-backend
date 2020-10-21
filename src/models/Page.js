const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    static associate({ User, Post, Picture }) {
      this.belongsToMany(User, { through: 'UserPages' });
      this.hasMany(Post);
      this.hasMany(Picture);
    }
  }
  Page.init(
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
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profilePhoto: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Page",
      tableName: "pages",
    }
  );
  return Page;
};
