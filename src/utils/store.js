const { Sequelize } = require("sequelize");
const { username, password, host, dialect } = require("./dbConfig");

module.exports.createStore = async () => {
  const sequelize = new Sequelize(dialect, username, password, {
    host,
    dialect,
  });

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  const user = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // createdAt: Sequelize.DATE,
    // updatedAt: Sequelize.DATE,
    email: Sequelize.STRING,
    firstname: Sequelize.STRING,
    lastname: Sequelize.STRING,
    age: Sequelize.INTEGER,
    school: Sequelize.STRING,
    isOnline: Sequelize.BOOLEAN
  });

  const trip = sequelize.define("trip", {
    launchId: Sequelize.INTEGER,
    userId: Sequelize.INTEGER,
  });
  // sequelize.drop();
  await sequelize.sync();
  return { sequelize, user, trip };
};
