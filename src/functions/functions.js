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

exports.getVideoById = async (id) => {
    try {
        const video = await Video.findOne({
            where: { id: id }
        });

        return video;
    } catch(err) {
        // error handling to do
    }
}

exports.createNewVideo = async (userId, title, description, private) => {
    try {
        const newVideo = await Video.create({ owner_id: userId, title, description, private });
        return newVideo;
    } catch(err) {
        // error handling to do
    }
}

exports.togglePrivacy = async (videoId, isPrivate) => {
    try {
        console.log(videoId, isPrivate);
        const [updatedRowsCount, [updatedVideo]] = await Video.update(
              { private: isPrivate },
              {
                where: { id: videoId },
                returning: true,
              }
            );

            if (updatedRowsCount === 0) {
                // how are we updating a video that doesn't exist?
                return null;
            }

            return updatedVideo;
    } catch(err) {

    }
}

exports.deleteVideo = async(videoId) => {
  try {
        // Use Sequelize to find the video by its ID and delete it
        const deletedVideoCount = await Video.destroy({
            where: {
                id: videoId,
            },
        });

        if (deletedVideoCount === 0) {
            // video doesn't exist
        }

        return true; // Video deleted successfully
    } catch (error) {
        console.error('Error deleting video:', error);
        throw error; // You can handle this error in your route handler
    }
}