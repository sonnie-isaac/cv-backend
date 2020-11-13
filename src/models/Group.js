const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate({ User, Picture }) {
      this.belongsToMany(User, { through: 'UserGroups', as: 'users', onDelete: 'CASCADE' });
      this.hasMany(Picture, { as: 'uploads', onDelete: 'CASCADE', /* hooks: true */ });
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
