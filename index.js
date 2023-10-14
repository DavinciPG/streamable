const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./src/config/config');
const Session = require('./src/models/Session');
const app = express();
const swaggerUi = require('swagger-ui-express');
const yamlJs = require('yamljs');
const swaggerDocument = yamlJs.load('./swagger.yaml');

const routing = require("./src/routing");

const cors = require('cors')

require('dotenv').config();

const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Use the Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware to parse JSON
app.use(express.json());

// Cors for all routes
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET, POST, PUT, DELETE',
    credentials: false
}));

const sessionStore = new SequelizeStore({
  db: db,
});

app.use(
  session({
    secret: 'doqdjasijxipm2013masodkqw',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

Session.sync();

// General error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    res.status(status).send(err.message);
})

// Routes
app.use('/', routing);

app.listen(port, () => {
    console.log(`App running. Docs at http://localhost:${port}/docs`);
})
