const bcrypt = require('bcrypt');
const User = require('../models/user');

// Handling user registration
exports.register = async (req, res, next) => {
    try {
        // Getting user input
        const { username, password, confirmPassword } = req.body;
        // TODO: Prevent bad characters from entering our code or injection attacks

        // Define a regular expression to match usernames with only alphanumeric characters and underscores
        const pattern = /^[a-zA-Z0-9_]+$/;
        if(!username.match(pattern)) {
            return res.render('users', { message: 'Username can only include alphanumeric characters and underscores!' })
        }

        // Checking if user already exists in database
        const existingUser = await User.findOne({
            where: {
                username: username
            }
        });
        if(existingUser) {
            return res.render('users', { message: 'User already exists!' });
        }

        if(username.length < 3 || username.length > 25) {
            return res.render('users', { message: 'Username length must be between 3 to 25 characters long!' });
        }

        if(password.length < 10 || password.length > 40) {
            return res.render('users', { message: 'Password length must be between 10 to 40 characters long!' });
        }

        if(password !== confirmPassword) {
            return res.render('users', { message: 'Passwords do not match!' })
        }

        // Hashing
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            password: hashed
        });

        // Saving user to db (mysql)
        await user.save();

        // TODO: Log in user here using session
        // Placeholder just setting req.session.user to user
        req.session.user = user;

        // Everything went fine
        return res.redirect('/');
    } catch (error) {
        next(error);
    }
};