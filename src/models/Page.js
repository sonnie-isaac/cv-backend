const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    static associate({ User, Picture }) {
      this.belongsToMany(User, { through: 'UserPages', as: 'users', onDelete: 'CASCADE' });
      this.hasMany(Picture, { as: 'uploads', onDelete: 'SET NULL' });
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
