const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();

router.get("/user", (req, res) => {
  const sessionCookie = (req.cookies && req.cookies.session) || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** check if revoked. */)
    .then((decodedClaims) => res.status(200).json(decodedClaims))
    .catch((error) => {
      res.status(401).send({ message: "Unathorized access", error });
    });
});

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

router.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();
  const csrfToken = req.body.csrfToken.toString();
  // req.headers.authorization = idToken
  // Guard against CSRF attacks.
  console.log("from sesslog:", req.headers.authorization);
  if (!req.cookies || csrfToken !== req.cookies.csrfToken) {
    res.status(401).send("UNAUTHORIZED REQUEST!");
    return;
  }
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // We could also choose to enforce that the ID token auth_time is recent.
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedClaims) => {
      // In this case, we are enforcing that the user signed in in the last 5 minutes.
      if (new Date().getTime() / 1000 - decodedClaims.auth_time < 5 * 60) {
        return admin.auth().createSessionCookie(idToken, { expiresIn });
      }
      throw new Error("UNAUTHORIZED REQUEST!");
    })
    .then((sessionCookie) => {
      // Note httpOnly cookie will not be accessible from javascript.
      // secure flag should be set to true in production.
      const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: false /** to test in localhost */,
      };
      res.cookie("session", sessionCookie, options);
      res.end(JSON.stringify({ status: "success" }));
    })
    .catch(() => {
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

router.get("/logout", (req, res) => {
  // Clear cookie.
  const sessionCookie = req.cookies.session || "";
  res.clearCookie("session");
  // Revoke session too. Note this will revoke all user sessions.
  if (sessionCookie) {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then((decodedClaims) =>
        admin.auth().revokeRefreshTokens(decodedClaims.sub)
      )
      .then(() => {
        res.status(200).send({ message: "Logout successful" });
      })
      .catch((error) => {
        res.status(401).send({ message: "You are not logged in", error });
      });
  } else {
    res.status(401).send({ message: "You are not logged in" });
  }
});

router.get("/delete", (req, res) => {
  const sessionCookie = req.cookies.session || "";
  res.clearCookie("session");
  if (sessionCookie) {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then((decodedClaims) => admin.auth().deleteUser(decodedClaims.sub))
      .then(() => {
        res.redirect("/login");
      })
      .catch(() => {
        res.redirect("/login");
      });
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
