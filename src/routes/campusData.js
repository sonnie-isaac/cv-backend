const express = require("express");
const { Reply, Post, Campus, User, Reaction, Message } = require("../models");

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { campusPath } = req.query;
    console.log(req.query);
    const campus = await Campus.findOne({ where: { path: campusPath } });
    const { id, name, path, description, profilePhoto } = campus;
    const membersCount = await campus.countMembers();

    const posts = await Post.findAll({ where: { campusId: campus.id }, include: ['uploads'], order: [['createdAt', 'DESC']], });
    /* if (posts.length) {
      posts = await posts.map(async (e) => {
        const replyCount = await e.countReplies();
        const likesCount = await e.countLikes();
        const { id, to, from, createdAt, content, reactions, pictures, user } = e;
        return ({ id, to, from, createdAt, content, reactions, pictures, user, replyCount, likesCount });
      });
    } */

    return res.status(200).send({ id, name, path, description, profilePhoto, posts, membersCount });
  } catch (err) {
    console.log(err)
    return res.status(400).send(err);
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

router.get('/post/reactions', async (req, res) => {
  const { postId } = req.query;
  try {
    const reactions = await Reaction.findAll({ where: { postId }, include: 'user' });
    return res.status(200).send(reactions);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/posts', async (req, res) => {
  // to === campus name
  try {
    const { id } = req.user;
    const { campusId, content, from, to } = req.body;
    const post = await Post.create({
      content,
      from,
      to
    });
    await post.setUser(id);
    await post.setCampus(campusId);
    return res.status(200).send(post);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get('/users', async (req, res) => {
  try {
    const { campusId } = req.query;
    const users = await User.findAll({ where: { campusId } });
    return res.status(200).send(users);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get('/allCampus', async (req, res) => {
  try {
    const campuses = await Campus.findAll({ order: [['id', 'ASC']], limit: 20 });
    return res.status(200).send(campuses);
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router;
