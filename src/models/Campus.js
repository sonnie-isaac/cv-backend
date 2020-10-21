const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Campus extends Model {
    static associate({ User, Post, Picture }) {
      this.hasMany(User);
      this.hasMany(Post);
      this.hasMany(Picture);
    }
  }
  Campus.init(
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
      alias: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.STRING,
      profilePhoto: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Campus",
      tableName: "campuses",
    }
  );
  return Campus;
};
