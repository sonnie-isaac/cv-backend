const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate({ User, Post, Picture }) {
      this.belongsToMany(User, { through: 'UserGroups' });
      this.hasMany(Post);
      this.hasMany(Picture);
    }
  }
  Group.init(
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
      profilePhoto: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Group",
      tableName: "groups",
    }
  );
  return Group;
};
