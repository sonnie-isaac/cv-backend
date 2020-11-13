const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Picture extends Model {
    static associate({ User, Group, Page, Campus }) {
      this.belongsTo(User, { as: 'user', foreignKey: 'userId' });
      this.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });
      this.belongsTo(Page, { as: 'page', foreignKey: 'pageId' });
      this.belongsTo(Campus, { as: 'campus', foreignKey: 'campusId' });
    }
  }
  Picture.init(
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
      url: DataTypes.TEXT,
      album: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Picture",
      tableName: "pictures",
    }
  );
  return Picture;
};
