const passport = require('passport');

exports.githubAuth = passport.authenticate('github', { scope: ['user:email'] });

exports.githubCallback = passport.authenticate('github', {
  failureRedirect: '/login',
  session: true,
}), (req, res) => {
  res.redirect('/profile');
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};
