/* eslint-disable no-multi-assign */
/* eslint-disable no-shadow */
const express = require("express");
const http = require("http");
const path = require("path");
// const next = require("next");
const cookieParser = require("cookie-parser");
const socketio = require("socket.io");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRouter = require("./src/routes/auth");
const userRouter = require("./src/routes/userData");
const pageRouter = require("./src/routes/pageData");
const campusRouter = require('./src/routes/campusData');
const chatApiRouter = require('./src/routes/chatApi');
const usersApiRouter = require('./src/routes/users');
const db = require("./src/models");
const SocketManager = require('./socketManager');
const campuses = require('./testSchools');
const emojis = require('./emojis');

const corsOptions = {
  origin: ['https://campusverve.com', 'http://localhost:3000'],
  credentials: true,
};

const port = parseInt(process.env.PORT, 10) || 4000;
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();
const JWT_SECRET = "107850581472402277730";

const server = express();
server.use(cors(corsOptions));
const httpServer = http.createServer(server);
const io = socketio(httpServer);

server.use(express.json());
server.use(cookieParser());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public")));
io.on('connection', SocketManager({ io, db }));

function checkIfSignedIn() {
  return (req, res, next) => {
    console.log(req.cookies);
    const token = (req.cookies && req.cookies.token) || "";
    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        req.io = io;
        return next();
      } catch (error) {
        return res.status(401).send({ message: "Unathorized access", error });
      }
    } else {
      return res.status(401).send({ message: "Unathorized access" });
    }
  };
}

server.use("/auth", authRouter);
server.use("/userData", checkIfSignedIn(), userRouter);
server.use("/pageData", checkIfSignedIn(), pageRouter);
server.use("/campusData", checkIfSignedIn(), campusRouter);
server.use("/chatApi", checkIfSignedIn(), chatApiRouter);
server.use("/api/users", checkIfSignedIn(), usersApiRouter);

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

function getEmoji(unicode) {
  return String.fromCodePoint(parseInt(unicode, 16));
}
server.get('/emojis', (req, res) => {
  let arr = Object.entries(emojis);
  arr = arr.map((e) => {
    const category = e[0];
    const emojis = e[1].map((el) => {
      const { name, unicode } = el;
      const char = unicode.split('-').map((e) => getEmoji(e)).join('');
      return { name, unicode, char };
    });
    return { category, emojis };
  });
  res.status(200).send(arr);
});


db.sequelize
  .authenticate()
  .then(async () => {
    // await db.sequelize.sync();
    // await db.sequelize.drop();
    // await db.sequelize.sync({ force: true });
    console.log("Database connected!!");
  })
  .catch((err) => console.log(err));

httpServer.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});

/* app.prepare().then(() => {
  server.get("/*", (req, res) => {
    req.fromServer = "append this value from server";
    return app.render(req, res, req.url, req.query);
  });

  server.all("*", (req, res) => handle(req, res));

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}); */
