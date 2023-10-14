const User = require('../models/User');
const Video = require('../models/Video');

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

exports.getUserById = async (id) => {
    try {
        const user = await User.findOne({
            where: {
                id: id
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

exports.getVideosForUser = async (userId) => {
    try {
        const videos = await Video.findAll({
           where: { owner_id: userId }
        });

        return videos;
    } catch(err) {
        // error handling to do
    }
}

exports.getVideoById = async (userId) => {
    try {
        const video = await Video.findOne({
            where: { owner_id: userId }
        });

        return video;
    } catch(err) {
        // error handling to do
    }
}