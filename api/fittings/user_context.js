const moment = require('moment');
const { unauthorized } = require('boom');

const { EMAIL_USER } = process.env;
const { Op } = require('sequelize');
const models = require('../models');
const logger = require('../services/logger');
const googleTokenStrategy = require('../helpers/google-auth');
const facebookTokenStrategy = require('../helpers/facebook-auth');

const LEGAL_PROVIDERS = ['facebook', 'google'];

function getProfile(provider, accessToken) {
  logger.info(`[UserContext:fitting] getProfile, provider:${provider}.`);

  return (provider === 'google'
    ? googleTokenStrategy.authenticate(accessToken)
    : facebookTokenStrategy.authenticate(accessToken));
}
function getFitting() {
  return async function UserContext({ request, response }, next) {
    try {
      logger.info(`[UserContext:fitting] ${request.method} request.`);
      if (request.method === 'OPTIONS') {
        return next();
      }

      const { headers } = request;
      const { provider } = headers;
      const accessToken = headers['x-auth-token'];
      if ((!provider || !accessToken) && request.url.includes('api')) {
        throw 'missing token headers';
      }
      if (!LEGAL_PROVIDERS.includes(provider)) {
        throw `unknown provider: ${provider}`;
      }

      console.log('************ ');
      console.log('request body: ');
      console.log(' ',request.body);
      console.log('************ ');
      const existingUser = await models.users.findOne({
        where: {
          token: accessToken,
          tokenExpiration: {
            [Op.gte]: new Date(),
          },
        },
      });

      if (existingUser) {
        const userContext = existingUser.toJSON();
        request.userContext = userContext;
        logger.info(`[UserContext:fitting] user exist, and is using token saved in db: ${userContext.firstName} ${userContext.familyName} (${userContext.email})`);

        await models.users.update({
          tokenExpiration: moment().add(1, 'days').toDate(),
        },
        {
          where: {
            id: existingUser.id,
          },
        });
        response.setHeader('x-user-context', encodeURI(JSON.stringify(userContext)));
        return next();
      }

      const profile = await getProfile(provider, accessToken);
      logger.info(`[UserContext:fitting] user request by: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

      // create/update user in db
      let user = await models.users.findOne({
        where: {
          email: profile.email,
        },
      });

      if (!user) {
        logger.info(`[UserContext:fitting] creating new user: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

        user = await models.users.create({ ...profile, tokenExpiration: moment().add(1, 'days').toDate(), token: accessToken });

      } else {
        logger.info(`[UserContext:fitting] user already in db: ${profile.firstName} ${profile.familyName}. (${profile.email})`);
        const [, results] = await models.users.update({ ...profile, tokenExpiration: moment().add(3, 'hours').toDate(), token: accessToken }, { where: { id: user.id }, returning: true });
        user = results[0];
      }

      request.userContext = user.toJSON();

      try {
        response.setHeader('x-user-context', encodeURI(JSON.stringify(request.userContext)));
      } catch (e) {
        response.setHeader('x-user-context', encodeURI(JSON.stringify({ email: request.userContext.email, token: request.userContext.token })));
      }

      return next();
    } catch (error) {
      console.log('fitting catch', error);
      if (typeof error === 'string') {
        logger.error(`[UserContext:fitting] error: ${error} `);

        return next(unauthorized(error));
      }

      logger.error(`[UserContext:fitting] error: ${JSON.stringify(error)} `);
      return next(unauthorized('failed to login'));
    }
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = getFitting;
