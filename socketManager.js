const { USER_CONNECTED, USERLIST, USER_DISCONNECTED,
  LOGOUT, COMMUNITY_CHAT, MESSAGE_RECIEVED, MESSAGE_SENT,
  TYPING, PRIVATE_MESSAGE } = require('./src/socket/eventsNode');

const getTime = (date) => `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;

const createMessage = ({ message = "", sender = "", db } = { }) => (
  {
    time: getTime(new Date(Date.now())),
    message,
    sender
  }

);

let connectedUsers = {};

module.exports = function ({ io, db }) {
  return function (socket) {
    function sendTypingToChat(user) {
      return (chatId, isTyping) => {
        io.emit(`${TYPING}-${chatId}`, { user, isTyping });
      };
    }

    function sendMessageToChat(sender) {
      return (chatId, message) => {
        // first save messave to chart in db
        io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({ message, sender }));
      };
    }

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

    let sendMessageToChatFromUser;
    // io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({ message, sender }))

    let sendTypingFromUser; // io.emit(`${TYPING}-${chatId}`, { user, isTyping });
    let userChats;

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

      sendMessageToChatFromUser = sendMessageToChat(user.name);
      sendTypingFromUser = sendTypingToChat(user.name);

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

    socket.on(MESSAGE_SENT, ({ chatId, message }) => {
      sendMessageToChatFromUser(chatId, message);
    });

    socket.on(TYPING, ({ chatId, isTyping }) => {
      sendTypingFromUser(chatId, isTyping);
    });

    // click on friend/chat calls socket.emit(PRIVATE_MESSAGE, {reciever, sender:user.username})

    socket.on(PRIVATE_MESSAGE, async ({ reciever, sender }) => {
      const users = [reciever, sender];
      if (reciever in connectedUsers) {
        const recieverSocket = connectedUsers[reciever].socketId;
        const proposedName = users.sort().join();
        if (proposedName in userChats) {
          socket.to(recieverSocket).emit(PRIVATE_MESSAGE, userChats[proposedName]);
          socket.emit(PRIVATE_MESSAGE, userChats[proposedName]);
        } else {
          const newChat = await db.Chat.create({
            name: proposedName,
          });
          userChats[proposedName] = newChat;
          const user1 = await db.User.findOne({ where: { username: sender } });
          const user2 = await db.User.findOne({ where: { username: reciever } });
          await newChat.addUser(user1);
          await newChat.addUser(user2);
          socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat);
          socket.emit(PRIVATE_MESSAGE, newChat);
        }
      } else {
        const proposedName = users.sort().join();
        if (proposedName in userChats) {
          socket.emit(PRIVATE_MESSAGE, userChats[proposedName]);
        } else {
          const newChat = await db.Chat.create({
            name: proposedName,
          });
          userChats[proposedName] = newChat;
          const user1 = await db.User.findOne({ where: { username: sender } });
          const user2 = await db.User.findOne({ where: { username: reciever } });
          await newChat.addUser(user1);
          await newChat.addUser(user2);
          socket.emit(PRIVATE_MESSAGE, newChat);
        }
      }
    });
  };
};
