const express = require("express");
const admin = require("firebase-admin");
const { Op } = require('sequelize');
const { User, Campus, Page, Friend, Post } = require("../models");

const router = express.Router();

const getFriends = async (username) => {
  const friendObject = await Friend.findOne({ where: { username } });
  const friends = friendObject ? await friendObject.getUsers() : [];
  return friends;
};

router.get('/', async (req, res) => {
  const { email } = req.user;
  console.log(email)
  try {
    const user = await User.findOne({ where: { email } });
    const { id,
      username,
      firstname,
      lastname,
      school,
      createdAt,
      profilePhoto,
      bio } = user;
    const chats = await user.getChats();
    const campus = await user.getCampus();
    const pages = await user.getPages();
    const pictures = await user.getPictures();
    const friends = await getFriends(username);

    let pageIds = pages.map((e) => ({ PageId: e.id }));
    pageIds = [...pageIds, { CampusId: campus.id }, { from: username }];
    let posts = await Post.findAll({ where: { [Op.or]: pageIds }, include: { all: true }, order: [['createdAt', 'DESC']], });
    posts = await posts.map(async (e) => {
      const replyCount = await e.countReplies();
      const reactionCount = await e.countReactions();
      const likesCount = await e.countLikes();
      const { id, to, from, createdAt, content, Reactions, Replies, Pictures, User } = e;
      return ({ id, to, from, createdAt, content, Reactions, Replies, Pictures, User, replyCount, reactionCount, likesCount });
    });
    const data = { id, email, username, firstname, lastname, createdAt, school, profilePhoto, bio, chats, campus, pages, pictures, posts, friends} || null;
    return res.status(200).json(data);
  } catch (error) {
    console.log(error)
    return res.status(400).json(error);
  }
});

router.post('/createUser', async (req, res) => {
  try {
    const user = await User.create(req.body);
    console.log(user);
    return res.status(200).send({ id: user.id, createdAt: user.createdAt });
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.post('/updateUser', async (req, res) => {
  try {
    // { email, firstname, lastname, profilePhoto, bio, emailVerified }
    const arr = Object.entries(req.body);
    const user = await User.findOne({ where: { email: req.body.email } });
    arr.forEach((e) => (user[e[0]] = e[1]));
    await user.save();
    return res.status(200).send({
      ...req.body,
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/setCampus', async (req, res) => {
  try {
    const { username, campusId } = req.body;
    const campus = await Campus.findOne({ where: { id: campusId } });
    const user = await User.findOne({ where: { username } });
    await user.setCampus(campus);
    return res.status(200).send(campus);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/addPage', async (req, res) => {
  try {
    const { username, pageId } = req.body;
    const page = await Page.findOne({ where: { id: pageId } });
    const user = await User.findOne({ where: { username } });
    await user.addPage(page);
    return res.status(200).send(page);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/addFriend', async (req, res) => {
  try {
    const { username, friendUsername } = req.body;
    const friend = await Friend.findOne({ where: { username: friendUsername } });
    const user = await User.findOne({ where: { username } });
    const friendInfo = await User.findOne({ where: { username: friendUsername } });
    await user.addFriend(friend);
    return res.status(200).send(friendInfo);
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router;
