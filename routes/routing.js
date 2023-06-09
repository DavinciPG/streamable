const userController = require('../controllers/user');
const router = require('express').Router();

// users - signup
// sessions - login

router.get('/users', (req, res) => {
    if(req.session.user) {
        res.redirect('/');
    } else {
        res.render('users');
    }
});
router.post('/users', userController.register);

router.get('/end-session', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.get('/', (req, res) => {
    if(req.session.user) {
        res.render('home', { user: req.session.user });
    } else {
        res.render('index');
    }
});

module.exports = router;