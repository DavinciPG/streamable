const User = require('../models/User')

exports.getUserByEmail = async (email) => {
    try {
        if(email === null || email.length <= 0)
            return null;

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