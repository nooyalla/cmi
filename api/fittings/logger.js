const log = require('../services/logger');

function getFitting() {
  return function logger({ request, response }, next) { // this is a global middleware
    const startTime = new Date();
    response.on('finish', () => {
      if (response.statusCode > 200) {
        const endTime = new Date();
        log.debug('[fitting:logger]: outgoing response', {
          method: request.method, url: request.url, status: response.statusCode, duration: endTime - startTime,
        });
      }
    });
    next();
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
