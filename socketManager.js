const { USER_CONNECTED, USERLIST, USER_DISCONNECTED,
  LOGOUT, COMMUNITY_CHAT, MESSAGE_RECIEVED, MESSAGE_SENT,
  TYPING, PRIVATE_MESSAGE, GET_CHAT, MESSAGE_REQUEST } = require('./src/socket/eventsNode');

const getTime = (date) => `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;

let connectedUsers = {};

module.exports = function ({ io, db }) {
  return function (socket) {
    function addUser(userList, user) {
      const newList = { ...userList };
      newList[user.name] = user;
      return newList;
    }

    function removeUser(userList, username) {
      const newList = { ...userList };
      delete newList[username];
      return newList;
    }

    console.log("Socket Id:" + socket.id);

    const sendMessageToChat = async (chatId, message, reciever) => {
      try {
        if (reciever in connectedUsers) {
          const recieverSocket = connectedUsers[reciever].socketId;
          const chat = await db.Chat.findOne({ where: { id: chatId } });
          const newMessage = await db.Message.create(message);
          await chat.addMessage(newMessage);
          socket.to(recieverSocket).emit(MESSAGE_RECIEVED, { message: newMessage, chatId });
        } else {
          const chat = await db.Chat.findOne({ where: { id: chatId } });
          const newMessage = await db.Message.create(message);
          // await newMessage.setChat(chat);
          await chat.addMessage(newMessage);
          console.log(newMessage);
        }
      } catch (err) {
        console.log('ERROR:', err);
      }
    };

    const sendTypingToChat = (chatId, isTyping, user) => {
      io.emit(`${TYPING}-${chatId}`, { user, isTyping });
    };
    let userChats;
    const fetchCount = 0;

    // User Connects with username
    socket.on(USER_CONNECTED, (user) => {
      const chats = {};
      if (user.chats) {
        user.chats.forEach((e) => {
          chats[e.name] = e;
        });
      }
      userChats = chats;
      user.socketId = socket.id;
      connectedUsers = addUser(connectedUsers, user);
      socket.user = user;

      socket.emit(USERLIST, connectedUsers);
      io.emit(USER_CONNECTED, user);
      console.log(connectedUsers);
    });

    // User disconnects
    socket.on('disconnect', () => {
      if ("user" in socket) {
        connectedUsers = removeUser(connectedUsers, socket.user.name);

        io.emit(USER_DISCONNECTED, socket.user.name);
        console.log("Disconnect", connectedUsers);
      }
    });

    socket.on(LOGOUT, () => {
      connectedUsers = removeUser(connectedUsers, socket.user.name);
      io.emit(USER_DISCONNECTED, socket.user.name);
      console.log("Disconnect", connectedUsers);
    });

    socket.on(MESSAGE_SENT, ({ chatId, message, reciever }) => {
      sendMessageToChat(chatId, message, reciever);
    });

    socket.on(TYPING, ({ chatId, isTyping }) => {
      sendTypingToChat(chatId, isTyping);
    });

    // click on friend/chat calls socket.emit(PRIVATE_MESSAGE, {reciever, sender:user.username})

    socket.on(PRIVATE_MESSAGE, async ({ reciever, sender, name }) => {
      // const users = [reciever, sender];
      try {
        if (reciever in connectedUsers) {
          const recieverSocket = connectedUsers[reciever].socketId;

          const newChat = await db.Chat.create({
            name,
          });
          userChats[name] = newChat;
          const user1 = await db.User.findOne({ where: { username: sender } });
          const user2 = await db.User.findOne({ where: { username: reciever } });
          await newChat.addUser(user1);
          await newChat.addUser(user2);
          socket.to(recieverSocket).emit(MESSAGE_REQUEST, { chat: newChat, users: [user1, user2] });
          socket.emit(PRIVATE_MESSAGE, { chat: newChat, users: [user1, user2] });
        } else {
          const newChat = await db.Chat.create({
            name,
          });
          console.log(newChat);
          userChats[name] = newChat;
          const user1 = await db.User.findOne({ where: { username: sender } });
          const user2 = await db.User.findOne({ where: { username: reciever } });
          await newChat.addUser(user1);
          await newChat.addUser(user2);
          socket.emit(PRIVATE_MESSAGE, { chat: newChat, users: [user1, user2] });
        }
      } catch (err) {
        console.log(err);
      }
    });

    /* socket.on(GET_CHAT, async (name) => {
      try {
        const chat = await db.Chat.findOne({ where: { name }, include: ['users', 'messages'] });
        socket.emit(GET_CHAT, chat);
        fetchCount += 1;
        console.log('chat fetched:', fetchCount);
      } catch (err) {
        console.log(err);
      }
    }); */
  };
};
