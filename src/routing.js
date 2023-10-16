const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const {
    getUserByEmail,
    createUser,
    getVideosForUser,
    getUserById,
    getVideoById,
    createNewVideo,
    togglePrivacy,
    deleteVideo
} = require('./functions/functions');

// globally stored hash rounds
const saltRounds = 10;

// POST SESSIONS
router.post('/sessions', async (req, res) => {
   try {
       // User should not be able to log in to a different account while already logged in.
       if(req.session.userId)
           return res.status(400).send('Already logged in!');

       // Validate email and password
       if (!req.body.email || !req.body.password) {
           return res.status(400).send('Email and password are required fields');
       }

       // TODO: Clean up email and password

       // Get user
       const user = await getUserByEmail(req.body.email);
       if (user === null) {
           return res.status(400).send('User not found')
       }

       const passwordsMatch = await bcrypt.compare(req.body.password, user.password);

       // Check password
       if (!passwordsMatch) {
           // TODO: invalidate attempts after 3 tries
           return res.status(400).send('Invalid password')
       }

       // Setting our user to be logged in
       req.session.userId = user.id;
       // Keep track of user logins
       console.log(`User ${user.id} logged in at ${Date.now()}`);

       // Return a new session
       res.status(201).send({userId: user.id});
   } catch(error) {
       console.error(error);
       res.status(500).send('Internal Server Error');
   }
});

// Making sure our Request is valid
function authenticateRequest(req, res, next) {
    // If session not found, return 401
    if (!req.session) {
        return res.status(401).send('Invalid session')
    }

    // Get user
    const user = getUserById(req.session.userId);

    // Validate user
    if (user === null) {
        console.warn(`User is logged in with invalid ID ${req.session.userId}`);
        return res.status(401).send('User not found')
    }

    // Continue processing the request
    next();
}

router.get('/session', authenticateRequest, async (req, res) => {
    // User is not logged in
    if (!req.session.userId) {
        return res.status(204).send(null);
    }
    res.status(200).send({userId: req.session.userId});
});

// Sessions log out
router.delete('/sessions', authenticateRequest, (req, res) => {
    req.session.destroy();

    // Return a 204 with no content if the session was deleted
    res.status(204).send();
});

router.put('/users', async (req, res) => {
    try {
        const {email, password, passwordconfirm} = req.body;

        // TODO: Clean up email, password, passwordconfirm

        if (!email || !password || !passwordconfirm) {
            return res.status(400).send('All fields are required!');
        }

        if (password !== passwordconfirm) {
            return res.status(400).send('Passwords do not match!');
        }

        const user = await getUserByEmail(email);
        if (user) {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // create the user
        const newUser = await createUser(email, hashedPassword);

        // This is not required cause createUser throws an error already, just in case keeping it.
        if (newUser === null)
            return res.status(500).send('Something went wrong!');

        req.session.userId = newUser.id;

        // Return a new session
        res.status(201).send({userId: newUser.id});
    } catch(error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/videos', authenticateRequest, async (req, res) => {
    try {
        const videos = await getVideosForUser(req.session.userId);
        res.status(200).json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/video/:id', authenticateRequest, async (req, res) => {
    try {
        const user = req.session.userId;
        const video = await getVideoById(req.params.id);

        if(!video)
            return res.status(400).send('Video does not exist!');

        if (video.owner_id !== user && video.private) {
            return res.status(401).send('Video is private!');
        }

        const videoPath = path.join(__dirname, 'videos', video.id + '.mp4');
        const videoStats = fs.statSync(videoPath);
        const fileSize = videoStats.size;

        res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': fileSize,
        });

        const videoStream = fs.createReadStream(videoPath);
        videoStream.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'videos');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

router.put('/videos', authenticateRequest, upload.single('videoFile'), async (req, res) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const privatevid = req.body.privatevid;
        const videoFile = req.file;

        if (!title || !description || !videoFile) {
            return res.status(400).send('Title, description, video file are required.');
        }

        const newVideo = await createNewVideo(req.session.userId, title, description, privatevid);

        // Save the video file to a specific folder
        const videoPath = path.join(__dirname, 'videos', newVideo.id + '.mp4');
        fs.renameSync(req.file.path, videoPath);

        // Return a success response
        res.status(201).send('Video uploaded successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/video/:id', authenticateRequest, async (req, res) => {
    try {
        const videoId = req.params.id;
        const user = req.session.userId;

        // Get the video by ID
        const video = await getVideoById(videoId);

        // Check if the video exists and if the user is the owner
        if (!video || video.owner_id !== user) {
            return res.status(403).send('Unauthorized');
        }

        // Delete the video file
        const videoPath = path.join(__dirname, 'videos', video.id + '.mp4');
        fs.unlinkSync(videoPath);

        // Delete the video from the database
        const deleted = await deleteVideo(videoId);

        if (deleted)
            res.status(204).send('Video deleted successfully');
        else
            res.status(500).send('Internal Server Error');
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/video/:id/toggle-privacy', authenticateRequest, async (req, res) => {
    try {
        await togglePrivacy(req.params.id, req.body.isprivate);
        res.status(201).send('Video privacy changed successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;