const express = require("express");
const { Op } = require('sequelize');
const { Chat, User, Message } = require("../models");

const router = express.Router();

router.get('/searchUsers', async (req, res) => {
  let { q } = req.query;
  q = q.toLowerCase();
  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          {
            firstname: {
              [Op.iLike]: `%${q}%`
            }
          },
          {
            lastname: {
              [Op.iLike]: `%${q}%`
            }
          },
          {
            username: {
              [Op.iLike]: `%${q}%`
            }
          },
          {
            fullname: {
              [Op.iLike]: `%${q}%`
            }
          },
        ]
      }
    });

    users.forEach((e) => e.password = null);
    return res.status(200).send(users);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.post('/allUserChats', async (req, res) => {
  const { ids } = req.body;
  try {
    const chats = await Chat.findAll({ where: { id: { [Op.or]: ids } }, include: ['messages', 'users'], order: [['createdAt', 'DESC']] });
    return res.status(200).send(chats);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.get('/messages', async (req, res) => {
  try {
    const msgs = await Message.findAll({ order: [['id', 'ASC']], limit: 20 });
    return res.status(200).send(msgs);
  } catch (err) {
    console.log('errors:', err);
    return res.status(400).send(err);
  }
});

router.get('/getChat/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const chat = await Chat.findOne({ where: { id }, include: ['messages', 'users'], order: [['createdAt', 'DESC']] });
    return res.status(200).send(chat);
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.get('/getAllChats', async (req, res) => {
  try {
    const chats = await Chat.findAll({ include: ['messages', 'users'], order: [['createdAt', 'DESC']] });
    return res.status(200).send(chats);
  } catch (error) {
    return res.status(400).send(error);
  }
});
router.get('/getAllSimple', async (req, res) => {
  try {
    const chats = await Chat.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).send(chats);
  } catch (error) {
    return res.status(400).send(error);
  }
});

module.exports = router;
