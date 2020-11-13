const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate({ Reaction, Chat, Message }) {
      this.hasMany(Reaction, { as: 'reactions', onDelete: 'SET NULL' });
      this.belongsTo(Chat, { as: 'chat', foreignKey: 'chatId' });
      this.hasOne(Message, { as: 'reply', onDelete: 'CASCADE' });
    }
  }
  Message.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      text: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
      sender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      replyId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
    }
  );
  Message.prototype.setReplyingTo = function (replyingToMessage) {
    return this.update({ replyId: replyingToMessage.id });
  };
  Message.prototype.getReplyingTo = function () {
    return this.sequelize.models.Message.findByPk(this.replyId);
  };

  return Message;
};
