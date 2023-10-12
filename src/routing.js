const express = require('express');
const router = express.Router();

const {v4: uuidv4} = require('uuid');

const { getUserByEmail } = require('./functions/functions')

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
    // Check password
    if (user.password !== req.body.password) {
        return res.status(400).send('Invalid password')
    }

    // If valid, create a session
    const session = {
        id: uuidv4(),
        userId: user.id,
        createdAt: new Date()
    }

    // Add session to sessions array
    sessions.push(session)

    // Return a new session
    res.status(201).send({sessionId: session.id})
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
    const sessionId = authHeaderParts[1]

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
    const user = users.find(user => user.id === session.userId)

    // Validate user
    if (!user) {
        return res.status(401).send('User not found')
    }

    // Add session to request
    req.session = session

    // Add user to request
    req.user = user

    // Continue processing the request
    next()
}

// Sessions log out
router.delete('/sessions', authenticateRequest, (req, res) => {

    // Remove session from sessions array
    sessions = sessions.filter(session => session.id !== req.session.id)

    // Return a 204 with no content if the session was deleted
    res.status(204).send()
});

module.exports = router;