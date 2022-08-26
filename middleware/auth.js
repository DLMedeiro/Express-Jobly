"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, NotFoundError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin)
      // If no one is logged in, or the logged in user is not an admin 
    throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}
// function ensureAdminOrUser(req, res, next) {
//   // console.log(res.locals.user)
//   // const qUser = req.params.username
//   // console.log(`qUser = ${qUser}`)
//   try {
//     // No user logged in
//     if (!res.locals.user) throw new UnauthorizedError();
//     // if user doesn't exist
//     if (!req.params.username) throw new UnauthorizedError();
//     // if logged in user is not an admin and does not match the query
//     if (!res.locals.user.isAdmin && (res.locals.user !== req.params.username)) throw new UnauthorizedError();

//     return next();
//   } catch (err) {
//     return next(err);
//   }
// }
function ensureAdminOrUser(req, res, next) {
  // console.log(res.locals.user)
  // const qUser = req.params.username
  // console.log(`qUser = ${qUser}`)
  try {
    if (!res.locals.user || ((req.params.username !== res.locals.user.username) && !res.locals.user.isAdmin)) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrUser
};
