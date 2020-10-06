/* eslint-disable no-shadow */
const express = require("express");
const http = require("http");
const path = require("path");

const cors = require("cors");
const firebaseAdmin = require("firebase-admin");
const cookieParser = require("cookie-parser");
const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const authRouter = require("./src/routes/auth");
const { createStore } = require("./src/utils/store");
const UserAPI = require("./src/datasources/user");
const { typeDefs, resolvers } = require("./src/schema/users.shema");

const port = parseInt(process.env.PORT, 10) || 4000;
const admin = firebaseAdmin.initializeApp();

const store = createStore();
const dataSources = () => ({
  userAPI: new UserAPI({ store }),
});

const app = express();
// app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

function attachCsrfToken(cookie, value) {
  return (req, res, next) => {
    res.cookie(cookie, value);
    next();
  };
}

function checkIfSignedIn() {
  return (req, res, next) => {
    const sessionCookie = (req.cookies && req.cookies.session) || "";
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** check if revoked. */)
      .then((decodedClaims) => {
        req.user = decodedClaims;
        console.log("cookies:", req.cookies);
        next();
      })
      .catch(() => {
        next();
      });
  };
}

app.use(
  attachCsrfToken("csrfToken", (Math.random() * 100000000000000000).toString())
);
app.use(checkIfSignedIn());
app.use("/auth", authRouter);

const context = ({ req, res }) => {
  console.log("from inside graphql:", req.headers.authorization);
  return { user: "me" };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context,
  playground: true,
});

/* const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use(
  "/api",
  // eslint-disable-next-line arrow-body-style
  graphqlHTTP((req, res) => {
    const { user } = req;
    console.log("from inside graphql:", req.cookies);
    console.log("from inside graphql:", user);
    console.log("from inside graphql:", req.headers.authorization);
    // if (!user) throw new Error("You must be logged in");
    return {
      schema,
      context: { startTime: Date.now(), dataSources, user },
      graphiql: true,
    };
  })
); */
server.applyMiddleware({ app });

http.createServer(app).listen(port, (err) => {
  if (err) throw err;
  console.log("🚀 Ready at http://localhost:4000/api");
});

/*
const context = async ({ req }) => {
  console.log(req.cookies);
  const sessionCookie = (req.cookies && req.cookies.session) || "";
  try {
    const user = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true );
      console.log(user);
      return { user };
    } catch (err) {
      throw new AuthenticationError("You must be logged in");
    }
  };
  */
