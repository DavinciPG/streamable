const User = require('../models/User');

// NOTE: ALL FUNCTIONS EXPECT YOU ARE SENDING FILTERED AND VALID ITEMS

exports.getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        });

        // you either get user or null
        return user;
    } catch(err) {
        // error handling to do
    }
}

exports.createUser = async (email, password) => {
    try {
        const newUser = await User.create({ email, password });
        // we return for extra validaiton checks
        return newUser;
    } catch(err) {
        // error handling to do
    }
}