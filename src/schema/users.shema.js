const { gql } = require("apollo-server-express");

exports.typeDefs = gql`
  type Query {
    getAllUsers: [User]!
  }
  type Mutation {
    createUser(id: ID, email: String!, firstname: String!, lastname: String!, age: Int): User
    updateUser(email: String, school: String, isOnline: Boolean): User
  }
  type Subscription {
    getAllUsers: [User]!
  }
  type User {
    id: ID!
    email: String!
    firstname: String!
    lastname: String!
    age: Int
    school: String
    createdAt: String
    updatedAt: String
    isOnline: Boolean
  }
  input UserDetails {
    email: String
    friends: [Friends]
    school: String
  }
  input Friends {
    email: String!
    firstname: String!
    lastname: String!
  }
`;

exports.resolvers = {
  Query: {
    getAllUsers(_, __, { dataSources }) {
      return dataSources.userAPI.getAll();
    },
  },
  Subscription: {
    getAllUsers(_, __, { dataSources }) {
      return dataSources.userAPI.getAll();
    },
  },
  Mutation: {
    // { email, firstname, lastname, age, school }
    createUser: async (_, args, { dataSources }) => {
      const { id, createdAt } = await dataSources.userAPI.createUser(args);
      return { ...args, id, createdAt };
    },
    updateUser: async (_, args, { dataSources }) => {
      const {
        id,
        createdAt,
        updatedAt,
        firstname,
      } = await dataSources.userAPI.updateUser(args);
      return { ...args, id, createdAt, updatedAt, firstname };
    },
  },
};
