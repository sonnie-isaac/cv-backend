const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ Picture, Group, User, Chat, Page, Campus }) {
      this.belongsToMany(Group, { through: 'UserGroups', as: 'groups' });
      this.belongsToMany(Chat, { through: 'UserChats', as: 'chats' });
      this.belongsToMany(Page, { through: 'UserPages', as: 'pages' });
      this.hasMany(User, { as: 'friends' });
      this.belongsTo(Campus, { as: 'campus', foreignKey: 'campusId' });
      this.hasMany(Picture, { as: 'photos' });
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
      password: {
        type: DataTypes.STRING,
        allowNull: false,
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
      fullname: DataTypes.STRING,
      school: DataTypes.STRING,
      isOnline: DataTypes.BOOLEAN,
      profilePhoto: DataTypes.TEXT,
      emailVerified: DataTypes.BOOLEAN,
      bio: DataTypes.TEXT,
      friendId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );
  User.prototype.addToUser = function (user) {
    return this.update({ friendId: user.id });
  };
  User.prototype.getUser = function () {
    return this.sequelize.models.User.findByPk(this.friendId);
  };

  return User;
};
