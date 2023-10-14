const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const { getUserByEmail, createUser, getVideosForUser, getUserById, getVideoById } = require('./functions/functions');

// globally stored hash rounds
const saltRounds = 10;

// POST SESSIONS
router.post('/sessions', async (req, res) => {
    // Validate email and password
    if (!req.body.email || !req.body.password) {
        return res.status(400).send('Email and password are required')
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
        return res.status(400).send('Invalid password')
    }

    req.session.userId = user.id;

    // Return a new session
    res.status(201).send({sessionId: req.session.id});
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
        return res.status(401).send('User not found')
    }

    // Continue processing the request
    next();
}

router.get('/session', authenticateRequest, async (req, res) => {
    res.status(201).send({sessionId: req.session.id});
});

// Sessions log out
router.delete('/sessions', authenticateRequest, (req, res) => {
    req.session.destroy(); // also needs error handling
    // Return a 204 with no content if the session was deleted
    res.status(204).send();
});

router.put('/users', async (req, res) => {
    const { email, password, passwordconfirm } = req.body;

    // TODO: Clean up email, password, passwordconfirm

    if (!email || !password || !passwordconfirm) {
        return res.status(400).send('All fields are required!');
    }

    if(password != passwordconfirm) {
        return res.status(400).send('Passwords do not match!');
    }

    const user = await getUserByEmail(email);
    if(user) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create the user
    const newUser = await createUser(email, hashedPassword);
    if(newUser === null) {
        return res.status(500).send('Something went wrong!');
    }

    req.session.userId = newUser.id;

    // Return a new session
    res.status(201).send({sessionId: req.session.id});
});

router.get('/videos', authenticateRequest, async (req, res) => {
    try {
        const videos = await getVideosForUser(req.session.userId);

        res.status(200).json(videos);
    } catch (error) {
        // error handling
    }
});

router.get('/video/:id', authenticateRequest, async (req, res) => {
    try {
        const user = req.session.userId;
        const video = await getVideoById(req.params.id);

        if (video.owner_id !== user && video.private) {
            return res.status(401).send('Video is private!');
        }

        res.status(200).json(video);
    } catch (error) {
        // error handling
    }
});

module.exports = router;