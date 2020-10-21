/* eslint-disable no-multi-assign */
/* eslint-disable no-shadow */
const express = require("express");
const http = require("http");
const path = require("path");
const firebaseAdmin = require("firebase-admin");
const cookieParser = require("cookie-parser");
const socketio = require("socket.io");
const cors = require('cors');
const authRouter = require("./src/routes/auth");
const usersRouter = require("./src/routes/userData");
const pageRouter = require("./src/routes/pageData");
const db = require("./src/models");
const SocketManager = require('./socketManager');
const campuses = require('./testSchools');

var corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, 
}

const port = parseInt(process.env.PORT, 10) || 4000;
const admin = firebaseAdmin.initializeApp();
const server = express();
server.use(cors(corsOptions));
const httpServer = http.createServer(server);
const io = socketio(httpServer);

server.use(express.json());
server.use(cookieParser());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public")));
io.on('connection', SocketManager({ io, db }));

function attachCsrfToken(cookie, value) {
  return (req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
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
        next();
      })
      .catch((error) => {
        res.status(401).send({ message: "Unathorized access", error });
      });
  };
}

server.use(
  attachCsrfToken("csrfToken", (Math.random() * 100000000000000000).toString())
);
server.use("/auth", authRouter);
server.use(checkIfSignedIn());

server.use("/userData", usersRouter);
server.use("/pageData", pageRouter);

server.get('/create-campuses', (req, res) => {
  try {
    campuses.forEach(async (c) => {
      const path = c.code.replace(/ /g, '-');
      await db.Campus.create({
        name: c.name,
        alias: c.code,
        path,
        description: `Welcome to the official page of ${c.name}. Everything ${c.code} 📗 📚 💻`
      });
    });
    res.status(200).send('all campus pages created');
  } catch (err) {
    res.status(404).json(err);
  }
});
server.get('/create-generals', async (req, res) => {
  try {
    const general = await db.Page.create({
      name: 'general',
      description: 'This page represents the meeting point of all members. Any one from any campus can post and respond on this group',
      path: 'general'
    });
    const announcement = await db.Page.create({
      name: 'announcement',
      description: 'This page is exclusively for announcements and news updates',
      path: 'announcements'
    });
    res.status(200).send({ general, announcement });
  } catch (err) {
    res.status(404).json(err);
  }
});

db.sequelize
  .authenticate()
  .then(async () => {
    // await db.sequelize.sync();
    // await db.sequelize.sync({ force: true });
    console.log("Database connected!!");
  })
  .catch((err) => console.log(err));

httpServer.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
