const express = require("express");
const admin = require("firebase-admin");
const { User, Campus, Page, Friend } = require("../models");

const router = express.Router();

router.get("/", (req, res) => {
  const sessionCookie = (req.cookies && req.cookies.session) || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** check if revoked. */)
    .then(async (decodedClaims) => {
      const { email } = decodedClaims;
      const user = await User.findOne({ where: { email }, include: { all: true } });
      return res.status(200).json(user);
    })
    .catch((error) => {
      res.status(401).send({ message: "Unathorized access", error });
    });
});

router.post("/register", async (req, res) => {
  const { email, password, username, firstname, lastname, school } = req.body;
  const errors = {};
  try {
    const userRecord = await admin
      .auth()
      .createUser({
        email,
        emailVerified: false,
        password,
        displayName: `${firstname} ${lastname}`,
        disabled: false,
      });
    const { uid } = userRecord;

    const user = await User.create({
      email,
      username,
      school,
      firebase_uid: uid,
      emailVerified: false,
      firstname,
      lastname,
    });
    await Friend.create({ username });
    const userCampus = await Campus.findOne({ where: { name: school } });
    const generalPage = await Page.findOne({ where: { name: 'general' } });
    const announcementPage = await Page.findOne({ where: { name: 'announcement' } });
    await user.setCampus(userCampus);
    await user.addPage(generalPage);
    await user.addPage(announcementPage);

    return res.status(201).send(user);
  } catch (err) {
    console.log(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      err.errors.forEach(
        (e) => (errors[e.path] = `${e.path} is already taken`)
      );
    } else if (err.name === 'SequelizeValidationError') {
      err.errors.forEach((e) => (errors[e.path] = e.message));
    }
    return res.status(400).json(errors);
  }
});

router.post("/email-verification", (req, res) => {
  const { email } = req.body;
  const actionCodeSettings = {
    url: "http://localhost:4000",
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
  console.log('from ses:',req.cookies)
  const idToken = req.body.idToken.toString();
  const csrfToken = req.body.csrfToken.toString();
  // req.headers.authorization = idToken
  // Guard against CSRF attacks.
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
        admin.auth().revokeRefreshTokens(decodedClaims.sub))
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
