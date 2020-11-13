const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate({ User, Message }) {
      this.belongsToMany(User, { through: 'UserChats', as: 'users', onDelete: 'CASCADE' });
      this.hasMany(Message, { as: 'messages', onDelete: 'SET NULL' });
    }
  }
  Chat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Chat",
      tableName: "chats",
    }
  );
  return Chat;
};
