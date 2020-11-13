/* eslint-disable func-names */
const { Model } = require("sequelize");

module.exports = async (sequelize, DataTypes) => {
  class Post extends Model {
    static associate({ Post, Group, Picture, Page, Campus }) {
      this.hasMany(Post, { as: 'replies', onDelete: 'CASCADE' });
      this.hasMany(Post, { as: 'shares' });
      this.hasMany(Post, { as: 'likes', onDelete: 'CASCADE' });
      this.hasMany(Picture, { as: 'uploads', onDelete: 'CASCADE', /* hooks: true */ });
      Picture.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
      this.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });
      this.belongsTo(Page, { as: 'page', foreignKey: 'pageId' });
      this.belongsTo(Campus, { as: 'campus', foreignKey: 'campusId' });
      // this.hasMany(Like, { as: 'likes', onDelete: 'CASCADE' });
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
      userAvatar: DataTypes.STRING,
      to: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      replyId: DataTypes.INTEGER,
      shareId: DataTypes.INTEGER,
      likeId: DataTypes.INTEGER,
      replyCount: DataTypes.INTEGER,
      likeCount: DataTypes.INTEGER,
      shareCount: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "posts",
    }
  );
  Post.prototype.setReplied = function (repliedPost) {
    return this.update({ replyId: repliedPost.id });
  };
  Post.prototype.getReplied = function () {
    return this.sequelize.models.Post.findByPk(this.replyId);
  };
  Post.prototype.setLiked = function (likedPost) {
    return this.update({ likeId: likedPost.id });
  };
  Post.prototype.getLiked = function () {
    return this.sequelize.models.Post.findByPk(this.likeId);
  };
  Post.prototype.setShared = function (sharedPost) {
    return this.update({ replyId: sharedPost.id });
  };
  Post.prototype.getShared = function () {
    return this.sequelize.models.Post.findByPk(this.shareId);
  };

  return Post;
};
