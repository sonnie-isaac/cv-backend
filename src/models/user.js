const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ Post, Picture, Reaction, Group, Friend, Chat, Reply, Page, Campus, Like }) {
      this.belongsToMany(Group, { through: 'UserGroups' });
      this.belongsToMany(Chat, { through: 'UserChats' });
      this.belongsToMany(Page, { through: 'UserPages' });
      this.belongsToMany(Friend, { through: 'UserFriends' });
      this.belongsTo(Campus);
      this.hasMany(Picture);
      this.hasMany(Post);
      this.hasMany(Reaction);
      this.hasMany(Reply);
      this.hasMany(Like);
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: "must be a valid email address",
          },
        },
      },
      firstname: DataTypes.STRING,
      lastname: DataTypes.STRING,
      school: DataTypes.STRING,
      isOnline: DataTypes.BOOLEAN,
      profilePhoto: DataTypes.TEXT,
      firebase_uid: DataTypes.STRING,
      emailVerified: DataTypes.BOOLEAN,
      bio: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );

  return User;
};
