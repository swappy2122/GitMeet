require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const User = require('./models/User');
const authRoutes = require('./controllers/routes/authRoutes');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ githubId: profile.id });

  if (!user) {
    user = await User.create({
      githubId: profile.id,
      username: profile.username,
      avatarUrl: profile._json.avatar_url
    });
  }

  done(null, user);
}));

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('<h2>Welcome. <a href="/auth/github">Login with GitHub</a></h2>');
});

app.get('/profile', (req, res) => {
  if (!req.user) return res.redirect('/');
  res.send(`<h2>Hello ${req.user.username}!</h2><img src="${req.user.avatarUrl}" width="100" /><br><a href="/auth/logout">Logout</a>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
