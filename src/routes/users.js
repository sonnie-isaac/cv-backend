const express = require("express");
const { Op } = require('sequelize');
const { User, Campus, Friend, Post, Reply, Picture } = require("../models");

const router = express.Router();
const TIMELINE = "TIMELINE";

const getFriends = async (username) => {
  const friendObject = await Friend.findOne({ where: { username } });
  const friends = await friendObject.getUsers();
  return friends;
};

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ where: { username }, include: ['campus'] });
    user.password = null;
    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.get('/:username/friends', async (req, res) => {
  try {
    const { username } = req.params;
    const friends = await getFriends(username);
    res.status(200).send(friends);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/:username/posts', async (req, res) => {
  const { username } = req.params;
  try {
    let posts = await Post.findAll({ where: { from: username }, include: ['uploads'], order: [['createdAt', 'DESC']], });
    posts = await posts.map(async (e) => {
      const replyCount = await e.countReplies();
      const reactionCount = await e.countReactions();
      const likesCount = await e.countLikes();
      return { ...e, replyCount, reactionCount, likesCount };
    });
    res.status(200).send(posts);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/post/:id/replies', async (req, res) => {
  const { postId } = req.params;
  try {
    const replies = await Reply.findAll({ where: { postId }, include: 'user' });
    return res.status(200).send(replies);
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router;
