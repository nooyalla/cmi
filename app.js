const SwaggerExpress = require('swagger-express-mw');

const express = require('express');

const app = express();
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { NODE_ENV, SERVER_PORT } = require('./config.js');
const logger = require('./api/services/logger');
const {sendHtmlMail} = require('./api/services/emails');
const terminate = require('./api/helpers/terminate');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs
});

const PUBLIC = path.join(__dirname, 'public');
const faviconPath = path.join(PUBLIC, 'favicon.ico');
app.use(compression());
app.use(express.static(PUBLIC));
app.use(favicon(faviconPath));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.disable('x-powered-by');
app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.use(limiter);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Expose-Headers', '*');
  next();
});


logger.info('app started..');
/**
 * Swagger initialization on top of express
 */
const config = {
  appRoot: __dirname,
};

logger.info('[lifecycle]: core service is booting up', {
  environment: NODE_ENV,
});


SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) { throw err; }


  swaggerExpress.register(app);


  const port = SERVER_PORT;
  logger.info('port', port);
  app.listen(port);
  logger.info('[lifecycle]: core service is now listening', {
    port,
  });
  try {
    sendHtmlMail('IT WORKS', '<div>YE!!!</div>', 'green.gilad@gmail.com');
  } catch (e) {
    console.log('failed to send email',e)
  }
});

module.exports = {
  server: app,
};
const exitHandler = terminate(app, {
  coredump: false, timeout: 500,
});
process.on('uncaughtException', exitHandler(1, 'Uncaught Exception'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));
