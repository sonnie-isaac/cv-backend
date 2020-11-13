const express = require("express");
const { Op } = require('sequelize');
const { User, Campus, Page, Friend, Post, Reply, Picture } = require("../models");

const router = express.Router();
const TIMELINE = "TIMELINE";

const getFriends = async (username) => {
  const friendObject = await Friend.findOne({ where: { username } });
  const friends = await friendObject.getUsers();
  return friends;
};

router.get('/friends', async (req, res) => {
  try {
    const { username } = req.user;
    const friends = await getFriends(username);
    res.status(200).send(friends);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/posts', async (req, res) => {
  const { username } = req.user;
  try {
    const posts = await Post.findAll({ where: { from: username }, include: ['uploads'], order: [['createdAt', 'DESC']], });
    /* posts = await posts.map(async (e) => {
      const replyCount = await e.countReplies();
      const reactionCount = await e.countReactions();
      const likesCount = await e.countLikes();
      return { ...e, replyCount, reactionCount, likesCount };
    }); */
    res.status(200).send(posts);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/post/replies', async (req, res) => {
  const { postId } = req.query;
  try {
    const replies = await Reply.findAll({ where: { postId }, include: 'user' });
    return res.status(200).send(replies);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/posts/timeline', async (req, res) => {
  try {
    const { id } = req.user;
    const { content, from, to } = req.body;
    const post = await Post.create({
      content,
      from,
      to
    });
    await post.setUser(id);
    return res.status(200).send(post);
  } catch (err) {
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
    return res.status(200).send(user);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/setCampus', async (req, res) => {
  try {
    const { userId, campusId } = req.body;
    const campus = await Campus.findOne({ where: { id: campusId } });
    await campus.addUser(userId);
    return res.status(200).send(campus);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/addPage', async (req, res) => {
  try {
    const { userId, pageId } = req.body;
    const page = await Page.findOne({ where: { id: pageId } });
    await page.addUser(userId);
    return res.status(200).send(page);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/addFriend', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    const friend = await Friend.findOne({ where: { id: friendId } });
    const friendInfo = await User.findOne({ where: { username: friend.username } });
    await friend.addUser(userId);
    return res.status(200).send(friendInfo);
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router;
