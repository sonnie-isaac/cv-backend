const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();

function checkIfSignedIn() {
  return (req, res, next) => {
    console.log(req.url);
    const sessionCookie = (req.cookies && req.cookies.session) || "";
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** check if revoked. */)
      .then((decodedClaims) => {
        req.user = decodedClaims;
        next();
      })
      .catch((error) => {
        res.status(401).send({ message: "Unathorized access", error });
      });
  };
}

router.post("/register", (req, res) => {
  const { email, password, firstname, lastname, school } = req.body;
  console.log(req.body);
  admin
    .auth()
    .createUser({
      email,
      emailVerified: false,
      password,
      displayName: `${firstname} ${lastname}`,
      disabled: false,
    })
    .then((userRecord) => {
      // admin.auth().generateEmailVerificationLink;
      console.log(userRecord);
      const { uid, displayName } = userRecord;
      const { creationTime } = userRecord.metadata;
      admin.firestore().doc(`users/${uid}`).set({
        email,
        school,
        uid,
        emailVerified: false,
        displayName,
        creationTime,
      });
      return userRecord;
    })
    .then((userRecord) => res.status(201).send(userRecord))
    .catch((error) => {
      console.log(error);
      return res.status(400).json(error);
    });
});

router.post("/email-verification", (req, res) => {
  const { email } = req.body;
  const actionCodeSettings = {
    url: "http://localhost:3000",
  };
  admin
    .auth()
    .generateEmailVerificationLink(email, actionCodeSettings)
    .then((link) => {
      console.log(link);
      res.status(200).send({ message: "Email verification sent" });
    })
    .catch((error) => {
      console.log(error);
      res.status(501).send(error);
    });
});

router.use(checkIfSignedIn());

router.get("/test", (req, res) => res.status(200).send("from users api"));

module.exports = router;
