const admin = require("firebase-admin");

const verifyIdToken = async (token) => (
  admin
    .auth()
    .verifyIdToken(token)
    .catch((error) => {
      throw error;
    })
);
module.exports = verifyIdToken;
