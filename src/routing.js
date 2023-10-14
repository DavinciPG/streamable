const express = require('express');
const router = express.Router();

const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcrypt');

const { getUserByEmail, createUser, getVideosForUser, getUserById } = require('./functions/functions');

// globally stored hash rounds
const saltRounds = 10;

let sessions = [];
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

    // If valid, create a session
    const session = {
        id: uuidv4(),
        userId: user.id,
        createdAt: new Date()
    }

    // Add session to sessions array
    sessions.push(session);

    // Return a new session
    res.status(201).send({sessionId: session.id});
});

// Making sure our Request is valid
function authenticateRequest(req, res, next) {
    // Check for authorization header
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('Authorization header is required')
    }

    // Check Authorization header format
    const authHeaderParts = authHeader.split(' ')
    if (authHeaderParts.length !== 2 || authHeaderParts[0] !== 'Bearer') {
        return res.status(401).send('Authorization header format must be "Bearer {token}"')
    }

    // Get session ID from header
    const authData = JSON.parse(authHeaderParts[1]);
    const sessionId = authData.sessionId;

    // Validate session ID
    if (!sessionId) {
        return res.status(401).send('Session ID is required')
    }

    // Get session
    const session = sessions.find(session => session.id === sessionId)

    // If session not found, return 401
    if (!session) {
        return res.status(401).send('Invalid session')
    }

    // Get user
    const user = getUserById(session.userId);

    // Validate user
    if (user === null) {
        return res.status(401).send('User not found')
    }

    // Add session to request
    req.session = session;

    // Add user to request
    req.user = user;

    // Continue processing the request
    next();
}

// Sessions log out
router.delete('/sessions', authenticateRequest, (req, res) => {

    // Remove session from sessions array
    sessions = sessions.filter(session => session.id !== req.session.id);

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

    const session = {
        id: uuidv4(),
        userId: newUser.id,
        createdAt: new Date()
    }

    // Add session to sessions array
    sessions.push(session);

    // Return a new session
    res.status(201).send({sessionId: session.id});
});

router.get('/videos', async (req, res) => {
    try {
        await authenticateRequest(req, res, () => {});
        const user = await req.user;
        const videos = await getVideosForUser(user.id);

        res.status(200).json(videos);
    } catch (error) {
        // error handling
    }
});

router.get('/video/:id', async (req, res) => {
    try {
        await authenticateRequest(req, res, () => {});
        const user = await req.user;
        const video = await getVideoById(req.params.id);

        if (video.owner_id !== user.id && video.private) {
            return res.status(401).send('Video is private!');
        }

        res.status(200).json(video);
    } catch (error) {
        // error handling
    }
});

module.exports = router;