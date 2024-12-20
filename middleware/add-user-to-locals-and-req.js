const User = require('../models/user'); // Adjust the path to your User model

module.exports = async function (req, res, next) {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    } catch (err) {
      console.error(err);
    }
  }
  next();
};
