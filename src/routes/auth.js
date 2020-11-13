const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Campus, Page, Friend } = require("../models");

const JWT_SECRET = "107850581472402277730";
const router = express.Router();

router.get("/", async (req, res) => {
  const token = (req.cookies && req.cookies.token) || "";
  if (token) {
    try {
      const { username } = jwt.verify(token, JWT_SECRET);
      const user = await User.findOne({ where: { username }, include: ['chats', 'pages', 'campus'] });
      user.password = null;
      return res.status(200).send(user);
    } catch (error) {
      return res.send({ error: "Unathorized access" });
      // return res.status(401).send({ message: "Unathorized access", error });
    }
  }
  return res.send({ error: "Access token not found" });
  // return res.status(401).send({ message: "Access token not found" });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username }, include: ['chats', 'pages', 'campus'] });

    if (!user) {
      throw new Error('User not found');
    }
    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      throw new Error('Password is incorrect');
    }
    const token = jwt.sign({ username, id: user.id }, JWT_SECRET, {
      expiresIn: "4h",
    });
    res.cookie('token', token, { expires: new Date(Date.now() + (1000 * 60 * 60 * 4)), httpOnly: true, });
    user.password = null;
    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/register", async (req, res) => {
  const { email, username, firstname, lastname, school } = req.body;
  let { password } = req.body;
  password = await bcrypt.hash(password, 6);
  const errors = {};
  try {
    const user = await User.create({
      email,
      username,
      password,
      school,
      emailVerified: false,
      firstname,
      lastname,
      fullname: `${lastname} ${firstname}`
    });
    await Friend.create({ username });
    const userCampus = await Campus.findOne({ where: { name: school } });
    const generalPage = await Page.findOne({ where: { name: 'general' } });
    const announcementPage = await Page.findOne({ where: { name: 'announcement' } });
    await user.setCampus(userCampus);
    await user.addPage(generalPage);
    await user.addPage(announcementPage);

    return res.status(201).send({ ...user, password: null });
  } catch (err) {
    console.log(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      err.errors.forEach(
        (e) => (errors[e.path] = `${e.path} is already taken`)
      );
    } else if (err.name === 'SequelizeValidationError') {
      err.errors.forEach((e) => (errors[e.path] = e.message));
    }
    console.log('errors:', errors);
    return res.status(400).json(errors);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).send({ message: 'Logout successful' });
});

module.exports = router;
