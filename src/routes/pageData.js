const express = require("express");
// const admin = require("firebase-admin");
// const { Op } = require('sequelize');
const { Page, Reply, Post, Campus } = require("../models");

const router = express.Router();

router.get('/page-simple', async (req, res) => {
  try {
    const { pagePath } = req.query;
    const page = await Page.findOne({ where: { path: pagePath }, include: { all: true } });
    res.status(200).send(page);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/campus-simple', async (req, res) => {
  try {
    const { pagePath } = req.query;
    const page = await Campus.findOne({ where: { path: pagePath }, include: { all: true } });
    res.status(200).send(page);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/', async (req, res) => {
  try {
    const { pagePath } = req.query;
    const page = await Page.findOne({ where: { path: pagePath }, include: { all: true } });
    const membersCount = await page.countUsers();
    const { id, name, path, description, profilePhoto, Users, Pictures } = page;

    let posts = await Post.findAll({ where: { PageId: page.id }, include: { all: true }, order: [['createdAt', 'DESC']], });
    posts = await posts.map(async (e) => {
      const replyCount = await e.countReplies();
      const reactionCount = await e.countReactions();
      const likesCount = await e.countLikes();
      const { id, to, from, createdAt, content, Reactions, Replies, Pictures, User } = e;
      return ({ id, to, from, createdAt, content, Reactions, Replies, Pictures, User, replyCount, reactionCount, likesCount });
    });
    const data = { id, name, path, description, profilePhoto, posts, membersCount, Users, Pictures } || null;
    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get('/campus', async (req, res) => {
  try {
    const { cName } = req.query;
    console.log(req.query);
    const campus = await Campus.findOne({ where: { name: cName }, include: { all: true } });
    const membersCount = await campus.countUsers();
    const { id, name, path, description, profilePhoto, Users, Pictures } = campus;

    let posts = await Post.findAll({ where: { CampusId: campus.id }, include: { all: true }, order: [['createdAt', 'DESC']], });
    posts = await posts.map(async (e) => {
      const replyCount = await e.countReplies();
      const reactionCount = await e.countReactions();
      const likesCount = await e.countLikes();
      const { id, to, from, createdAt, content, Reactions, Replies, Pictures, User } = e;
      return ({ id, to, from, createdAt, content, Reactions, Replies, Pictures, User, replyCount, reactionCount, likesCount });
    });
    const data = { id, name, path, description, profilePhoto, posts, membersCount, Users, Pictures } || null;
    return res.status(200).send(data);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get('/postReplies', async (req, res) => {
  try {
    const { PostId } = req.query;
    const replies = await Reply.findAll({ where: { PostId }, include: { all: true } });
    return res.status(200).send(replies);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.get('/allCampus', async (req, res) => {
  try {
    const campuses = await Campus.findAll({ order: [['alias', 'ASC']], limit: 20 });
    return res.status(200).send(campuses);
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router;
