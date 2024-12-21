const User = require('../models/user');

module.exports = (req, res, next) => {
  if (req.session.userId) {
    User.findById(req.session.userId)
      .then((user) => {
        req.user = user;
        res.locals.user = user;
        next();
      })
      .catch((err) => {
        console.error(err);
        next();
      });
  } else {
    next();
  }
};
