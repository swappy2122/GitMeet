const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const githubCallback = async (req, res) => {
    console.log(req.user);
    const token = jwt.sign(
        {
            id: req.user.id,
            username: req.user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.redirect(`http://localhost:5173/login/success?token=${token}`);
}

module.exports = {
    githubCallback,
}