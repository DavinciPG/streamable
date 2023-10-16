const User = require('../models/User');
const Video = require('../models/Video');
const LoginAttempts = require('../models/LoginAttempts');
const Logins = require('../models/Logins');

// NOTE: ALL FUNCTIONS EXPECT YOU ARE SENDING FILTERED AND VALID ITEMS

exports.getUserByEmail = async (email) => {
    try {
        // for some reason User.findOne cannot do the check itself
        if(email === undefined)
            return null;

        // you either get user or null
        return await User.findOne({
            where: {
                email: email
            }
        });
    } catch(err) {
        console.error(err);
        throw err;
    }
}

exports.getUserById = async (id) => {
    try {
        // for some reason User.findOne cannot do the check itself
        if(id === undefined)
            return null;

        // you either get user or null
        return await User.findOne({
            where: {
                id: id
            }
        });
    } catch(err) {
        console.error(err);
        throw err;
    }
}

exports.createUser = async (email, password, loginIP) => {
    try {
        const newUser = await User.create({ email, password, IP: loginIP });

        console.log(`User created ${newUser.id}`);
        return newUser;
    } catch(err) {
        console.error(err);
        throw err;
    }
}

exports.getVideosForUser = async (userId) => {
    try {
        const videos = await Video.findAll({
           where: { owner_id: userId }
        });

        console.log(`Searched for user: ${userId} videos, returned ${videos.length} videos.`);
        return videos;
    } catch(err) {
        console.error(err);
        throw err;
    }
}

exports.getVideoById = async (id) => {
    try {
        const video = await Video.findOne({
            where: { id: id }
        });

        // NOTE: You technically do not have to log this, upon having a large user base you should either be not logging or logging to a separate file. Just gets in the way of other needed logs.
        // For a view system you can do the increasing of views in here also, just get the owner of the video and check the session userId to make sure they are different, so it does not increase when you watch your own videos.
        console.log(`Requested video ${id}.`);
        return video;
    } catch(err) {
        console.error(err);
        throw err;
    }
}

exports.createNewVideo = async (userId, title, description, privatee) => {
    try {
        const newVideo = await Video.create({ owner_id: userId, title, description, privatee });

        console.log(`Created new video ${newVideo.id}.`);
        return newVideo;
    } catch(err) {
        console.error(err);
        throw err;
    }
}

exports.togglePrivacy = async (videoId, isPrivate) => {
    try {
        const result = await Video.update(
              { private: isPrivate },
              {
                where: { id: videoId },
                returning: true,
              }
            );

            if (result.length === 0) {
                // Should never occur on your own code.
                console.error(`Trying to update video [${videoId}] that does not exist!`);
                return null;
            }

            console.log(`Video privacy [${videoId}] changed to ${isPrivate}`);
            return result;
    } catch(err) {
        console.error(err);
        throw err;
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
            console.error(`Tried deleting video [${videoId}] which does not exist!`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting video:', error);
        throw error;
    }
}

exports.getAttempts = async (IP) => {
    try {
        return await LoginAttempts.findAll({ where: { IP: IP }});
    } catch(error) {
        console.error(error);
        throw error;
    }
}

exports.insertAttempt = async (IP) => {
    try {
        return await LoginAttempts.create( { IP: IP});
    } catch(error) {
        console.error(error);
        throw error;
    }
}

exports.insertLogin = async (IP, uid) => {
    try {
        return await Logins.create( { IP: IP, userId: uid });
    } catch(error) {
        console.error(error);
        throw error;
    }
}

exports.cleanEmail = async(email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if(!emailRegex.test(email))
        return false;

    return true;
}