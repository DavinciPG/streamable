const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./src/config/config');
const Session = require('./src/models/Session');
const app = express();
const swaggerUi = require('swagger-ui-express');
const yamlJs = require('yamljs');
const swaggerDocument = yamlJs.load('./swagger.yaml');
const cookieParser = require('cookie-parser');
const http = require('http');

const routing = require("./src/routing");

const cors = require('cors');

const server = http.createServer(app);

require('dotenv').config();

const port = process.env.PORT || 3000;
const ip = process.env.IP;

// Serve static files
app.use(express.static('public'));

app.use(cookieParser(process.env.SECRET));

// Use the Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware to parse JSON
app.use(express.json({limit: '50mb'}));

// Cors for all routes
app.use(cors({
    origin: `http://${ip}:${port}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE' ],
    credentials: true
}));

const sessionStore = new SequelizeStore({
  db: db,
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
      cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 7 // 1000 ms * 60s * 60m * 24h * 7d = 7d worth of seconds
      }
  })
);

Session.sync();

// General error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    res.status(status).send(err.message);
    next();
});

// Routes
app.use('/', routing);

server.listen(port, ip, () => {
    const url = `http://${ip}:${port}`;
    console.log(`App running. Docs at ${url}/docs`);
})
