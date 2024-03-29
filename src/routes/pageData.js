const express = require("express");
const { Page, Reply, Post, Reaction } = require("../models");

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { pagePath } = req.query;
    const page = await Page.findOne({ where: { path: pagePath } });
    const { id, name, path, description, profilePhoto } = page;
    const membersCount = await page.countUsers();

    const posts = await Post.findAll({ where: { pageId: page.id }, include: ['uploads'], order: [['createdAt', 'DESC']], });
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
    console.log(err);
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
  try {
    const { id } = req.user;
    const { pageId, content, from, to } = req.body;
    const post = await Post.create({
      content,
      from,
      to
    });
    await post.setUser(id);
    await post.setPage(pageId);
    return res.status(200).send(post);
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router;
