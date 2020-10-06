const { DataSource } = require("apollo-datasource");

class UserAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;
  }

  initialize(config) {
    this.context = config.context;
  }

  async getUser({ email }) {
    const store = await this.store;
    const user = await store.user.findOne({ where: { email } });
    return user || null;
  }

  async getAll() {
    const store = await this.store;
    const users = await store.user.findAll();
    console.log(users[0]);
    console.log(this.context);
    return users;
  }

  async createUser(args) {
    // { email, firstname, lastname, age, school }
    const store = await this.store;
    const user = await store.user.create(args);
    console.log(user);
    return { ...args, id: user.id, createdAt: user.createdAt };
  }

  async updateUser(args) {
    // { email, firstname, lastname, age, school }
    const store = await this.store;
    const arr = Object.entries(args);
    const user = await store.user.findOne({ where: { email: args.email } });
    arr.forEach((e) => (user[e[0]] = e[1]));
    await user.save();
    return {
      ...args,
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstname: user.firstname,
    };
  }
}

module.exports = UserAPI;
