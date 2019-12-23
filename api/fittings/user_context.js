const {Op} = require('sequelize');
const models = require('../models');
const googleTokenStrategy = require('../helpers/google-auth');
const facebookTokenStrategy = require('../helpers/facebook-auth');

const LEGAL_PROVIDERS = ['facebook', 'google'];

function getProfile(provider, accessToken) {
    console.log(`[UserContext:fitting] getProfile, provider:${provider}.`);

    return (provider === 'google'
        ? googleTokenStrategy.authenticate(accessToken)
        : facebookTokenStrategy.authenticate(accessToken));
}


async function GetUserContext({request, response}, next) {
    try {
        console.log(`[UserContext:fitting] ${request.method} request.`);

        const {headers} = request;
        const {provider} = headers;
        const accessToken = headers['x-auth-token'];
        if (!provider || !accessToken) {
            throw 'missing token headers';
        }
        if (!LEGAL_PROVIDERS.includes(provider)) {
            throw `unknown provider: ${provider}`;
        }
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
            console.log(`[UserContext:fitting] user exist, and is using token saved in db: ${userContext.firstName} ${userContext.familyName} (${userContext.email})`);
            await validateRequestPermissions(request);

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
        console.log(`[UserContext:fitting] user request by: ${profile.firstName} ${profile.familyName}. (${profile.email})`);

        // create/update user in db
        let user = await models.users.findOne({
            where: {
                email: profile.email,
            },
        });

        if (!user) {
            console.log(`[UserContext:fitting] creating new user: ${profile.firstName} ${profile.familyName}. (${profile.email})`);
            user = await models.users.create({
                ...profile,
                tokenExpiration: moment().add(1, 'days').toDate(),
                token: accessToken
            });
        } else {
            console.log(`[UserContext:fitting] user already in db: ${profile.firstName} ${profile.familyName}. (${profile.email})`);
            const [, results] = await models.users.update({
                ...profile,
                tokenExpiration: moment().add(3, 'hours').toDate(),
                token: accessToken
            }, {where: {id: user.id}, returning: true});
            user = results[0];
        }

        request.userContext = user.toJSON();

        await validateRequestPermissions(request);

        try {
            response.setHeader('x-user-context', encodeURI(JSON.stringify(request.userContext)));
        } catch (e) {
            response.setHeader('x-user-context', encodeURI(JSON.stringify({
                email: request.userContext.email,
                token: request.userContext.token
            })));
        }

        return next();
    } catch (error) {
        if (typeof error === 'string') {
            console.log(`[UserContext:fitting] error: ${error} `);

            return next(unauthorized(error));
        }

        console.log(`[UserContext:fitting] error: ${JSON.stringify(error)} `);
        return next(unauthorized('failed to login'));
    }
}


module.exports = GetUserContext;
